import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type AppMessageChannel,
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/whatsapp-attachment-deadline-margin-milliseconds.constant';
import { WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/whatsapp-import-history-timeout-seconds.constant';
import { WHATSAPP_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappHistoryImportProgress } from 'src/logic-functions/types/whatsapp-history-import-progress.type';
import { type WhatsappImportHistoryJobPayload } from 'src/logic-functions/types/whatsapp-import-history-job-payload.type';
import { type WhatsappIngestResult } from 'src/logic-functions/types/whatsapp-ingest-result.type';
import { enqueueWhatsappImportHistoryJob } from 'src/logic-functions/utils/enqueue-whatsapp-import-history-job.util';
import { failWhatsappHistoryImportJob } from 'src/logic-functions/utils/fail-whatsapp-history-import-job.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappImportHistoryJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { ingestWhatsappMessages } from 'src/logic-functions/utils/ingest-whatsapp-messages.util';
import { withWhatsappGroupParticipants } from 'src/logic-functions/utils/with-whatsapp-group-participants.util';
import {
  getWhatsappHistoryImportChunkChats,
  getWhatsappHistoryImportProgress,
  saveWhatsappHistoryImportProgress,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { getUnipileChatIfExists } from 'src/unipile/utils/get-unipile-chat-if-exists.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const WHATSAPP_IMPORT_HISTORY_TIME_BUDGET_MILLISECONDS = 10 * 60 * 1000;

type WhatsappImportHistoryResult = {
  status: 'CANCELLED' | 'SKIPPED' | 'PAUSED' | 'COMPLETED';
  importedConversationCount?: number;
};

type WhatsappImportHistoryTotals = {
  messageCount: number;
  matchedPersonCount: number;
  createdPersonCount: number;
  attachmentCount: number;
  skippedChatCounts: Record<
    NonNullable<WhatsappIngestResult['skippedReason']>,
    number
  >;
};

class WhatsappImportHistoryHandOff extends Error {}

const handOffToNextChunk = async ({
  connectedAccountId,
  runId,
  chunkIndex,
}: WhatsappImportHistoryJobPayload): Promise<void> => {
  const nextChunk = { connectedAccountId, runId, chunkIndex: chunkIndex + 1 };

  if ((await getWhatsappHistoryImportChunkChats(nextChunk)) !== null) {
    await enqueueWhatsappImportHistoryJob(nextChunk);
  }
};

const saveProgressIfActive = async ({
  payload,
  progress,
}: {
  payload: WhatsappImportHistoryJobPayload;
  progress: WhatsappHistoryImportProgress;
}): Promise<boolean> => {
  if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
    return false;
  }

  await saveWhatsappHistoryImportProgress({ ...payload, progress });

  return true;
};

export const whatsappImportHistoryHandler = async (
  payload: WhatsappImportHistoryJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<WhatsappImportHistoryResult> => {
  const invokedAt = Date.now();

  if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  const { connectedAccountId, runId, chunkIndex } = payload;
  const startProgress = await getWhatsappHistoryImportProgress(payload);

  if (startProgress.completedChunkCount === chunkIndex + 1) {
    await handOffToNextChunk(payload);

    return { status: 'SKIPPED' };
  }

  const chats = await getWhatsappHistoryImportChunkChats(payload);

  if (startProgress.completedChunkCount !== chunkIndex || chats === null) {
    return { status: 'SKIPPED' };
  }

  const startedAt = Date.now();
  const attachmentDeadlineAtMs =
    invokedAt +
    WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS * 1000 -
    WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;
  const jobId = getWhatsappImportHistoryJobId(payload);
  const logPrefix = `[whatsapp] history run ${runId} chunk ${chunkIndex}`;
  let importedConversationCount = startProgress.currentChunkImportedCount ?? 0;
  let processedChatCount = startProgress.currentChunkProcessedCount;
  let chatCursor = startProgress.currentChatCursor;
  let isChatImported = startProgress.isCurrentChatImported ?? false;
  const totals: WhatsappImportHistoryTotals = {
    messageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
    attachmentCount: 0,
    skippedChatCounts: {
      NOT_SELECTED: 0,
      NO_MESSAGES: 0,
      NO_PHONE: 0,
      NO_CONTACT: 0,
    },
  };

  const buildCurrentProgress = (): WhatsappHistoryImportProgress => ({
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
      throw new WhatsappImportHistoryHandOff('cancelled');
    }
  };

  const resumeLater = async ({
    delayMs,
    reason,
  }: {
    delayMs: number;
    reason: string;
  }): Promise<WhatsappImportHistoryResult> => {
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
          currentJobId: getWhatsappImportHistoryJobId(resumePayload),
          currentResumeIndex: resumePayload.resumeIndex,
          resumeAt,
        },
      }))
    ) {
      return { status: 'CANCELLED' };
    }

    await enqueueWhatsappImportHistoryJob(resumePayload, delayMs);

    console.log(
      `[whatsapp] history run ${runId} chunk ${chunkIndex}: paused after ${processedChatCount} of ${chats.length} chats${isDefined(resumeAt) ? ` until ${resumeAt}` : ''}: ${reason}`,
    );

    return { status: 'PAUSED' };
  };

  const finishChat = async (): Promise<void> => {
    if (isChatImported) {
      importedConversationCount += 1;
    }

    processedChatCount += 1;
    isChatImported = false;
    chatCursor = undefined;

    await saveCurrentProgress();
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
    settings: WhatsappSettings;
  }): Promise<void> => {
    const fetchedChat =
      getWhatsappChatCounterparts(listedChat).length > 0
        ? listedChat
        : await getUnipileChatIfExists({
            accountId: unipileAccountId,
            chatId: listedChat.id,
          });

    if (!isDefined(fetchedChat)) {
      console.log(
        `${logPrefix}: conversation ${listedChat.id} skipped, it no longer exists`,
      );
      await finishChat();

      return;
    }

    const chat = await withWhatsappGroupParticipants({
      unipileAccountId,
      chat: fetchedChat,
    });

    const counterparts = getWhatsappChatCounterparts(chat);
    const seenCursors = new Set<string>();
    let skippedReason: WhatsappIngestResult['skippedReason'];

    do {
      if (
        Date.now() - startedAt >
        WHATSAPP_IMPORT_HISTORY_TIME_BUDGET_MILLISECONDS
      ) {
        throw new WhatsappImportHistoryHandOff('time budget reached');
      }

      const page = await listUnipileChatMessagesPage({
        accountId: unipileAccountId,
        chatId: chat.id,
        cursor: chatCursor,
      });

      console.log(
        `${logPrefix}: start importing ${page.items.length} messages from conversation ${chat.id}`,
      );

      const ingestResult = await ingestWhatsappMessages({
        unipileAccountId,
        attachmentDeadlineAtMs,
        channel,
        settings,
        chat,
        counterparts,
        messages: page.items,
      });

      console.log(
        `${logPrefix}: ${ingestResult.ingestedMessageCount} messages imported from conversation ${chat.id}`,
      );

      skippedReason = ingestResult.skippedReason;
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

    console.log(
      `${logPrefix}: conversation ${chat.id} ${isChatImported ? 'imported' : `skipped (${skippedReason ?? 'NO_MESSAGES'})`}`,
    );
    await finishChat();
  };

  try {
    const connection = await getConnection(connectedAccountId);
    const unipileAccountId = connection.externalAccountId;
    const [channel] = await listMessageChannels({ connectedAccountId });

    if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
      throw new Error(
        `WhatsApp connection ${connectedAccountId} has no Unipile account or message channel`,
      );
    }

    const settings = await getWhatsappSettings(connectedAccountId);

    for (const listedChat of chats.slice(processedChatCount)) {
      await importChat({
        listedChat,
        unipileAccountId,
        channel,
        settings,
      });
    }
  } catch (error) {
    if (error instanceof WhatsappImportHistoryHandOff) {
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

    return failWhatsappHistoryImportJob({
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
    `[whatsapp] history run ${runId} chunk ${chunkIndex}: ` +
      `${chats.length} chats (last messages ${chats[0]?.last_message_timestamp ?? '-'} to ${chats[chats.length - 1]?.last_message_timestamp ?? '-'}), ` +
      `${importedConversationCount} conversations imported, ${totals.messageCount} messages, ` +
      `${totals.matchedPersonCount} people matched, ${totals.createdPersonCount} people created, ${totals.attachmentCount} attachments, ` +
      `skipped ${totals.skippedChatCounts.NO_CONTACT} without contact, ${totals.skippedChatCounts.NO_PHONE} without phone number, ${totals.skippedChatCounts.NO_MESSAGES} without messages, ` +
      `in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );

  if (!isActive) {
    return { status: 'CANCELLED' };
  }

  await handOffToNextChunk(payload);

  return { status: 'COMPLETED', importedConversationCount };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-import-history',
  description:
    'Imports one page of past WhatsApp conversations of a connection, page of messages by page of messages, then queues the next page once it is listed, so one page is imported at a time.',
  timeoutSeconds: WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: whatsappImportHistoryHandler,
});
