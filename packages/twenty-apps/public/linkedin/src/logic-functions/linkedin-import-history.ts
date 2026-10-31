import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportProgress } from 'src/logic-functions/types/linkedin-history-import-progress.type';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinImportHistoryJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import {
  getLinkedinHistoryImportChunkChats,
  getLinkedinHistoryImportProgress,
  saveLinkedinHistoryImportProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';
import { listUnipileChatMessages } from 'src/unipile/utils/list-unipile-chat-messages.util';

type LinkedinImportHistoryResult = {
  status: 'CANCELLED' | 'SKIPPED' | 'PAUSED' | 'COMPLETED';
  importedConversationCount?: number;
};

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
  const chats = await getLinkedinHistoryImportChunkChats(payload);

  if (startProgress.completedChunkCount === chunkIndex + 1) {
    await handOffToNextChunk(payload);

    return { status: 'SKIPPED' };
  }

  if (startProgress.completedChunkCount !== chunkIndex || chats === null) {
    return { status: 'SKIPPED' };
  }

  const startedAt = Date.now();
  const jobId = getLinkedinImportHistoryJobId(payload);
  let importedConversationCount = startProgress.currentChunkImportedCount ?? 0;
  let processedChatCount = startProgress.currentChunkProcessedCount;

  const buildCurrentProgress = (): LinkedinHistoryImportProgress => ({
    completedChunkCount: startProgress.completedChunkCount,
    completedConversationCount: startProgress.completedConversationCount,
    importedConversationCount: startProgress.importedConversationCount,
    currentChunkProcessedCount: processedChatCount,
    currentChunkImportedCount: importedConversationCount,
    currentJobId: jobId,
  });
  const totals = {
    messageCount: 0,
    matchedPersonCount: 0,
    createdPersonCount: 0,
  };
  const skippedChatCounts = {
    GROUP_CHATS_OFF: 0,
    NO_MESSAGES: 0,
    NO_CONTACT: 0,
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
      const chat =
        getLinkedinChatCounterparts(listedChat).length > 0
          ? listedChat
          : await getUnipileChat({
              accountId: unipileAccountId,
              chatId: listedChat.id,
            });

      const ingestResult = await ingestLinkedinMessages({
        channel,
        settings,
        chat,
        counterparts: await Promise.all(
          getLinkedinChatCounterparts(chat).map((user) =>
            withLinkedinPublicIdentifier({ unipileAccountId, user }),
          ),
        ),
        messages: await listUnipileChatMessages({
          accountId: unipileAccountId,
          chatId: chat.id,
        }),
      });

      totals.messageCount += ingestResult.ingestedMessageCount;
      totals.matchedPersonCount += ingestResult.matchedPersonCount;
      totals.createdPersonCount += ingestResult.createdPersonCount;

      if (isDefined(ingestResult.skippedReason)) {
        skippedChatCounts[ingestResult.skippedReason] += 1;
      }

      if (ingestResult.ingestedMessageCount > 0) {
        importedConversationCount += 1;
      }

      processedChatCount += 1;

      if (
        !(await saveProgressIfActive({
          payload,
          progress: buildCurrentProgress(),
        }))
      ) {
        return { status: 'CANCELLED' };
      }
    }
  } catch (error) {
    if (error instanceof UnipileRateLimitError) {
      const resumePayload = {
        ...payload,
        resumeIndex: (payload.resumeIndex ?? 0) + 1,
      };
      const resumeAt = new Date(
        Date.now() + error.retryAfterSeconds * 1000,
      ).toISOString();

      if (
        !(await saveProgressIfActive({
          payload,
          progress: {
            ...buildCurrentProgress(),
            currentJobId: getLinkedinImportHistoryJobId(resumePayload),
            resumeAt,
          },
        }))
      ) {
        return { status: 'CANCELLED' };
      }

      await enqueueLinkedinImportHistoryJob(
        resumePayload,
        error.retryAfterSeconds * 1000,
      );

      console.log(
        `[linkedin] history run ${runId} chunk ${chunkIndex}: paused after ${processedChatCount} of ${chats.length} chats until ${resumeAt}: ${error.message}`,
      );

      return { status: 'PAUSED' };
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
      `${totals.matchedPersonCount} people matched, ${totals.createdPersonCount} people created, ` +
      `skipped ${skippedChatCounts.NO_CONTACT} without contact, ${skippedChatCounts.GROUP_CHATS_OFF} group chats, ${skippedChatCounts.NO_MESSAGES} without messages, ` +
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
    'Imports one page of past LinkedIn conversations of a connection, then queues the next page once it is listed, so one page is imported at a time.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinImportHistoryHandler,
});
