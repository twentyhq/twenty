import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  kv,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportChunkResult } from 'src/logic-functions/types/linkedin-history-import-chunk-result.type';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinHistoryImportChunkKvKey } from 'src/logic-functions/utils/get-linkedin-history-import-chunk-kv-key.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { listUnipileChatMessages } from 'src/unipile/utils/list-unipile-chat-messages.util';

type LinkedinImportHistoryResult = {
  status: 'CANCELLED' | 'COMPLETED';
  importedConversationCount?: number;
};

const saveChunkResult = async ({
  payload,
  result,
}: {
  payload: LinkedinImportHistoryJobPayload;
  result: LinkedinHistoryImportChunkResult;
}): Promise<void> => {
  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return;
  }

  await kv.set(getLinkedinHistoryImportChunkKvKey(payload), result);
};

export const linkedinImportHistoryHandler = async (
  payload: LinkedinImportHistoryJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinImportHistoryResult> => {
  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  const { connectedAccountId } = payload;
  const startedAt = Date.now();
  let importedConversationCount = 0;
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
  const lastMessageTimestamps: string[] = [];

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

    for (const chatId of payload.chatIds) {
      const chat = await getUnipileChat({
        accountId: unipileAccountId,
        chatId,
      });

      if (isNonEmptyString(chat.last_message_timestamp)) {
        lastMessageTimestamps.push(chat.last_message_timestamp);
      }

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
          chatId,
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
    }
  } catch (error) {
    return failLinkedinHistoryImportJob({
      error,
      context,
      onFinalFailure: (importError) =>
        saveChunkResult({
          payload,
          result: { importedConversationCount, error: importError },
        }),
    });
  }

  await saveChunkResult({ payload, result: { importedConversationCount } });

  const sortedTimestamps = [...lastMessageTimestamps].sort();

  console.log(
    `[linkedin] history run ${payload.runId} chunk ${payload.chunkIndex}: ` +
      `${payload.chatIds.length} chats (last messages ${sortedTimestamps[sortedTimestamps.length - 1] ?? '-'} to ${sortedTimestamps[0] ?? '-'}), ` +
      `${importedConversationCount} conversations imported, ${totals.messageCount} messages, ` +
      `${totals.matchedPersonCount} people matched, ${totals.createdPersonCount} people created, ` +
      `skipped ${skippedChatCounts.NO_CONTACT} without contact, ${skippedChatCounts.GROUP_CHATS_OFF} group chats, ${skippedChatCounts.NO_MESSAGES} without messages, ` +
      `in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );

  return { status: 'COMPLETED', importedConversationCount };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-history',
  description:
    'Imports one chunk of past LinkedIn conversations of a connection.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinImportHistoryHandler,
});
