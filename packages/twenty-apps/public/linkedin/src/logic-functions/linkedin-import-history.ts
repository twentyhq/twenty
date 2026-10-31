import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AppMessageChannel,
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportProgress } from 'src/logic-functions/types/linkedin-history-import-progress.type';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { type LinkedinIngestResult } from 'src/logic-functions/types/linkedin-ingest-result.type';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinImportHistoryJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import {
  getLinkedinHistoryImportChunkChats,
  getLinkedinHistoryImportProgress,
  saveLinkedinHistoryImportProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const LINKEDIN_IMPORT_HISTORY_TIME_BUDGET_MILLISECONDS = 10 * 60 * 1000;

type LinkedinImportHistoryResult = {
  status: 'CANCELLED' | 'SKIPPED' | 'PAUSED' | 'COMPLETED';
  importedConversationCount?: number;
};

type LinkedinImportHistoryTotals = {
  messageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  attachmentCount: number;
  skippedChatCounts: Record<
    NonNullable<LinkedinIngestResult['skippedReason']>,
    number
  >;
};

class LinkedinImportHistoryHandOff extends Error {}

const handOffToNextChunk = async ({
  connectedAccountId,
  runId,
  chunkIndex,
}: LinkedinImportHistoryJobPayload): Promise<void> => {
  const nextChunk = { connectedAccountId, runId, chunkIndex: chunkIndex + 1 };

  if ((await getLinkedinHistoryImportChunkChats(nextChunk)) !== null) {
    await enqueueLinkedinImportHistoryJob(nextChunk);
  }
};

const saveProgressIfActive = async ({
  payload,
  progress,
}: {
  payload: LinkedinImportHistoryJobPayload;
  progress: LinkedinHistoryImportProgress;
}): Promise<boolean> => {
  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return false;
  }

  await saveLinkedinHistoryImportProgress({ ...payload, progress });

  return true;
};

export const linkedinImportHistoryHandler = async (
  payload: LinkedinImportHistoryJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinImportHistoryResult> => {
  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  const { connectedAccountId, runId, chunkIndex } = payload;
  const startProgress = await getLinkedinHistoryImportProgress(payload);

  if (startProgress.completedChunkCount === chunkIndex + 1) {
    await handOffToNextChunk(payload);

    return { status: 'SKIPPED' };
  }

  const chats = await getLinkedinHistoryImportChunkChats(payload);

  if (startProgress.completedChunkCount !== chunkIndex || chats === null) {
    return { status: 'SKIPPED' };
  }

  const startedAt = Date.now();
  const jobId = getLinkedinImportHistoryJobId(payload);
  let importedConversationCount = startProgress.currentChunkImportedCount ?? 0;
  let processedChatCount = startProgress.currentChunkProcessedCount;
  let chatCursor = startProgress.currentChatCursor;
  let isChatImported = startProgress.isCurrentChatImported ?? false;
  const totals: LinkedinImportHistoryTotals = {
    messageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
    attachmentCount: 0,
    skippedChatCounts: { GROUP_CHATS_OFF: 0, NO_MESSAGES: 0, NO_CONTACT: 0 },
  };

  const buildCurrentProgress = (): LinkedinHistoryImportProgress => ({
    completedChunkCount: startProgress.completedChunkCount,
    completedConversationCount: startProgress.completedConversationCount,
    importedConversationCount: startProgress.importedConversationCount,
    currentChunkProcessedCount: processedChatCount,
    currentChunkImportedCount: importedConversationCount,
    currentChatCursor: chatCursor,
    isCurrentChatImported: isChatImported,
    currentJobId: jobId,
    currentResumeIndex: payload.resumeIndex,
  });

  const saveCurrentProgress = async (): Promise<void> => {
    if (
      !(await saveProgressIfActive({
        payload,
        progress: buildCurrentProgress(),
      }))
    ) {
      throw new LinkedinImportHistoryHandOff('cancelled');
    }
  };

  const resumeLater = async ({
    delayMs,
    reason,
  }: {
    delayMs: number;
    reason: string;
  }): Promise<LinkedinImportHistoryResult> => {
    const resumePayload = {
      ...payload,
      resumeIndex: (payload.resumeIndex ?? 0) + 1,
    };
    const resumeAt =
      delayMs > 0 ? new Date(Date.now() + delayMs).toISOString() : undefined;

    if (
      !(await saveProgressIfActive({
        payload,
        progress: {
          ...buildCurrentProgress(),
          currentJobId: getLinkedinImportHistoryJobId(resumePayload),
          currentResumeIndex: resumePayload.resumeIndex,
          resumeAt,
        },
      }))
    ) {
      return { status: 'CANCELLED' };
    }

    await enqueueLinkedinImportHistoryJob(resumePayload, delayMs);

    console.log(
      `[linkedin] history run ${runId} chunk ${chunkIndex}: paused after ${processedChatCount} of ${chats.length} chats${isDefined(resumeAt) ? ` until ${resumeAt}` : ''}: ${reason}`,
    );

    return { status: 'PAUSED' };
  };

  const importChat = async ({
    listedChat,
    unipileAccountId,
    channel,
    settings,
  }: {
    listedChat: UnipileChat;
    unipileAccountId: string;
    channel: AppMessageChannel;
    settings: LinkedinSettings;
  }): Promise<void> => {
    const chat =
      getLinkedinChatCounterparts(listedChat).length > 0
        ? listedChat
        : await getUnipileChat({
            accountId: unipileAccountId,
            chatId: listedChat.id,
          });
    const counterparts = await Promise.all(
      getLinkedinChatCounterparts(chat).map((user) =>
        withLinkedinPublicIdentifier({ unipileAccountId, user }),
      ),
    );
    const seenCursors = new Set<string>();

    do {
      if (
        Date.now() - startedAt >
        LINKEDIN_IMPORT_HISTORY_TIME_BUDGET_MILLISECONDS
      ) {
        throw new LinkedinImportHistoryHandOff('time budget reached');
      }

      const page = await listUnipileChatMessagesPage({
        accountId: unipileAccountId,
        chatId: chat.id,
        cursor: chatCursor,
      });
      const ingestResult = await ingestLinkedinMessages({
        unipileAccountId,
        channel,
        settings,
        chat,
        counterparts,
        messages: page.items,
      });

      totals.messageCount += ingestResult.ingestedMessageCount;
      totals.matchedPersonCount += ingestResult.matchedPersonCount;
      totals.createdPersonCount += ingestResult.createdPersonCount;
      totals.attachmentCount += ingestResult.importedAttachmentCount;
      isChatImported ||= ingestResult.ingestedMessageCount > 0;

      if (isDefined(ingestResult.skippedReason) && !isDefined(chatCursor)) {
        totals.skippedChatCounts[ingestResult.skippedReason] += 1;
      }

      const nextCursor = page.nextCursor;
      const isLastPage =
        page.items.length === 0 ||
        !isNonEmptyString(nextCursor) ||
        seenCursors.has(nextCursor);

      chatCursor = isLastPage ? undefined : nextCursor;

      if (isNonEmptyString(nextCursor)) {
        seenCursors.add(nextCursor);
      }

      if (!isLastPage) {
        await saveCurrentProgress();
      }
    } while (isDefined(chatCursor));

    if (isChatImported) {
      importedConversationCount += 1;
    }

    processedChatCount += 1;
    isChatImported = false;

    await saveCurrentProgress();
  };

  try {
    const connection = await getConnection(connectedAccountId);
    const unipileAccountId = connection.externalAccountId;
    const [channel] = await listMessageChannels({ connectedAccountId });

    if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
      throw new Error(
        `LinkedIn connection ${connectedAccountId} has no Unipile account or message channel`,
      );
    }

    const settings = await getLinkedinSettings(connectedAccountId);

    for (const listedChat of chats.slice(processedChatCount)) {
      await importChat({ listedChat, unipileAccountId, channel, settings });
    }
  } catch (error) {
    if (error instanceof LinkedinImportHistoryHandOff) {
      return error.message === 'cancelled'
        ? { status: 'CANCELLED' }
        : resumeLater({ delayMs: 0, reason: error.message });
    }

    if (error instanceof UnipileRateLimitError) {
      return resumeLater({
        delayMs: error.retryAfterSeconds * 1000,
        reason: error.message,
      });
    }

    return failLinkedinHistoryImportJob({
      error,
      context,
      onFinalFailure: async (importError) => {
        await saveProgressIfActive({
          payload,
          progress: { ...buildCurrentProgress(), error: importError },
        });
      },
    });
  }

  const isActive = await saveProgressIfActive({
    payload,
    progress: {
      completedChunkCount: chunkIndex + 1,
      completedConversationCount:
        startProgress.completedConversationCount + chats.length,
      importedConversationCount:
        startProgress.importedConversationCount + importedConversationCount,
      currentChunkProcessedCount: 0,
    },
  });

  console.log(
    `[linkedin] history run ${runId} chunk ${chunkIndex}: ` +
      `${chats.length} chats (last messages ${chats[0]?.last_message_timestamp ?? '-'} to ${chats[chats.length - 1]?.last_message_timestamp ?? '-'}), ` +
      `${importedConversationCount} conversations imported, ${totals.messageCount} messages, ` +
      `${totals.matchedPersonCount} people matched, ${totals.createdPersonCount} people created, ${totals.attachmentCount} attachments, ` +
      `skipped ${totals.skippedChatCounts.NO_CONTACT} without contact, ${totals.skippedChatCounts.GROUP_CHATS_OFF} group chats, ${totals.skippedChatCounts.NO_MESSAGES} without messages, ` +
      `in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );

  if (!isActive) {
    return { status: 'CANCELLED' };
  }

  await handOffToNextChunk(payload);

  return { status: 'COMPLETED', importedConversationCount };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-history',
  description:
    'Imports one page of past LinkedIn conversations of a connection, page of messages by page of messages, then queues the next page once it is listed, so one page is imported at a time.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinImportHistoryHandler,
});
