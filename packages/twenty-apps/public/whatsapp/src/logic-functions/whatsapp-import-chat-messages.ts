import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/whatsapp-attachment-deadline-margin-milliseconds.constant';
import { WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/whatsapp-import-history-timeout-seconds.constant';
import { WHATSAPP_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappHistoryImportChatJobResult } from 'src/logic-functions/types/whatsapp-history-import-chat-job-result.type';
import { type WhatsappImportChatMessagesJobPayload } from 'src/logic-functions/types/whatsapp-import-chat-messages-job-payload.type';
import { type WhatsappLegacyImportHistoryJobPayload } from 'src/logic-functions/types/whatsapp-legacy-import-history-job-payload.type';
import { finishWhatsappHistoryImportChat } from 'src/logic-functions/utils/finish-whatsapp-history-import-chat.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { handleWhatsappHistoryImportChatJobError } from 'src/logic-functions/utils/handle-whatsapp-history-import-chat-job-error.util';
import { ingestWhatsappChatMessages } from 'src/logic-functions/utils/ingest-whatsapp-messages.util';
import { scheduleWhatsappHistoryImportChatJob } from 'src/logic-functions/utils/schedule-whatsapp-history-import-chat-job.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';

const importChatMessagesPage = async ({
  payload,
  attachmentDeadlineAtMs,
}: {
  payload: WhatsappImportChatMessagesJobPayload;
  attachmentDeadlineAtMs: number;
}): Promise<WhatsappHistoryImportChatJobResult> => {
  const { connectedAccountId, runId, chat, cursor, pageIndex } = payload;
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account or message channel`,
    );
  }

  const page = await listUnipileChatMessagesPage({
    accountId: unipileAccountId,
    chatId: chat.id,
    cursor,
  });

  const { ingestedMessageCount, importedAttachmentCount } =
    await ingestWhatsappChatMessages({
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
    `[whatsapp] history run ${runId} conversation ${chat.id} page ${pageIndex}: ${ingestedMessageCount} messages, ${importedAttachmentCount} attachments imported`,
  );

  const nextCursor = page.nextCursor;

  if (
    page.items.length > 0 &&
    isNonEmptyString(nextCursor) &&
    nextCursor !== cursor
  ) {
    const isScheduled = await scheduleWhatsappHistoryImportChatJob({
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

  const isActive = await finishWhatsappHistoryImportChat({
    connectedAccountId,
    runId,
    chatId: chat.id,
    status: hasImportedMessages ? 'IMPORTED' : 'SKIPPED',
  });

  return { status: isActive ? 'COMPLETED' : 'CANCELLED' };
};

export const whatsappImportChatMessagesHandler = async (
  payload:
    | WhatsappImportChatMessagesJobPayload
    | WhatsappLegacyImportHistoryJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<WhatsappHistoryImportChatJobResult> => {
  const invokedAt = Date.now();

  if (
    !('chat' in payload) ||
    !isDefined(await getActiveWhatsappHistoryImportState(payload))
  ) {
    return { status: 'CANCELLED' };
  }

  try {
    return await importChatMessagesPage({
      payload,
      attachmentDeadlineAtMs:
        invokedAt +
        WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS * 1000 -
        WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    return handleWhatsappHistoryImportChatJobError({
      job: { kind: 'MESSAGES', payload },
      error,
      context,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_IMPORT_CHAT_MESSAGES_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-import-chat-messages',
  description:
    'Imports one page of messages of a past WhatsApp conversation, most recent first, then queues the next page.',
  timeoutSeconds: WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: whatsappImportChatMessagesHandler,
});
