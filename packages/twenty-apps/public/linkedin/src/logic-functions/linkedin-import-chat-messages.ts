import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS } from 'src/constants/linkedin-history-import-timeout-seconds.constant';
import { LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportChatJobResult } from 'src/logic-functions/types/linkedin-history-import-chat-job-result.type';
import { type LinkedinImportChatMessagesJobPayload } from 'src/logic-functions/types/linkedin-import-chat-messages-job-payload.type';
import { finishLinkedinHistoryImportChat } from 'src/logic-functions/utils/finish-linkedin-history-import-chat.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { handleLinkedinHistoryImportChatJobError } from 'src/logic-functions/utils/handle-linkedin-history-import-chat-job-error.util';
import { ingestLinkedinChatMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { scheduleLinkedinHistoryImportChatJob } from 'src/logic-functions/utils/schedule-linkedin-history-import-chat-job.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';

const importChatMessagesPage = async ({
  payload,
  attachmentDeadlineAtMs,
}: {
  payload: LinkedinImportChatMessagesJobPayload;
  attachmentDeadlineAtMs: number;
}): Promise<LinkedinHistoryImportChatJobResult> => {
  const { connectedAccountId, runId, chat, cursor, pageIndex } = payload;
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account or message channel`,
    );
  }

  const page = await listUnipileChatMessagesPage({
    accountId: unipileAccountId,
    chatId: chat.id,
    cursor,
  });

  const { ingestedMessageCount, importedAttachmentCount } =
    await ingestLinkedinChatMessages({
      unipileAccountId,
      attachmentDeadlineAtMs,
      channel,
      chat,
      counterparts: payload.counterparts,
      personIdByHandle: new Map(Object.entries(payload.personIdByHandle)),
      messages: page.items,
    });
  const hasImportedMessages =
    (payload.hasImportedMessages ?? false) || ingestedMessageCount > 0;

  console.log(
    `[linkedin] history run ${runId} conversation ${chat.id} page ${pageIndex}: ${ingestedMessageCount} messages, ${importedAttachmentCount} attachments imported`,
  );

  const nextCursor = page.nextCursor;

  if (
    page.items.length > 0 &&
    isNonEmptyString(nextCursor) &&
    nextCursor !== cursor
  ) {
    const isScheduled = await scheduleLinkedinHistoryImportChatJob({
      job: {
        kind: 'MESSAGES',
        payload: {
          ...payload,
          cursor: nextCursor,
          pageIndex: pageIndex + 1,
          hasImportedMessages,
          attempt: undefined,
        },
      },
    });

    return { status: isScheduled ? 'CONTINUED' : 'CANCELLED' };
  }

  const isActive = await finishLinkedinHistoryImportChat({
    connectedAccountId,
    runId,
    chatId: chat.id,
    status: hasImportedMessages ? 'IMPORTED' : 'SKIPPED',
  });

  return { status: isActive ? 'COMPLETED' : 'CANCELLED' };
};

export const linkedinImportChatMessagesHandler = async (
  payload: LinkedinImportChatMessagesJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinHistoryImportChatJobResult> => {
  const invokedAt = Date.now();

  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  try {
    return await importChatMessagesPage({
      payload,
      attachmentDeadlineAtMs:
        invokedAt +
        LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS * 1000 -
        LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    return handleLinkedinHistoryImportChatJobError({
      job: { kind: 'MESSAGES', payload },
      error,
      context,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-chat-messages',
  description:
    'Imports one page of messages of a past LinkedIn conversation, most recent first, then queues the next page.',
  timeoutSeconds: LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS,
  handler: linkedinImportChatMessagesHandler,
});
