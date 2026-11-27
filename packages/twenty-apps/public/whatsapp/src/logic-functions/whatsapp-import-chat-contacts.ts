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
import { WHATSAPP_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappHistoryImportChatJobResult } from 'src/logic-functions/types/whatsapp-history-import-chat-job-result.type';
import { type WhatsappImportChatContactsJobPayload } from 'src/logic-functions/types/whatsapp-import-chat-contacts-job-payload.type';
import { finishWhatsappHistoryImportChat } from 'src/logic-functions/utils/finish-whatsapp-history-import-chat.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { handleWhatsappHistoryImportChatJobError } from 'src/logic-functions/utils/handle-whatsapp-history-import-chat-job-error.util';
import { mapWhatsappMessages } from 'src/logic-functions/utils/map-whatsapp-messages.util';
import { resolveWhatsappChatPersons } from 'src/logic-functions/utils/resolve-whatsapp-chat-persons.util';
import { setWhatsappChatPersonAvatars } from 'src/logic-functions/utils/set-whatsapp-chat-person-avatars.util';
import { isWhatsappChatSelected } from 'src/logic-functions/utils/is-whatsapp-chat-selected.util';
import { isWhatsappGroupChat } from 'src/logic-functions/utils/is-whatsapp-group-chat.util';
import { scheduleWhatsappHistoryImportChatJob } from 'src/logic-functions/utils/schedule-whatsapp-history-import-chat-job.util';
import { scheduleNextWhatsappHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-whatsapp-history-import-contacts.util';
import { toWhatsappCounterparts } from 'src/logic-functions/utils/to-whatsapp-counterparts.util';
import { withWhatsappGroupParticipants } from 'src/logic-functions/utils/with-whatsapp-group-participants.util';
import { getUnipileChatIfExists } from 'src/unipile/utils/get-unipile-chat-if-exists.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';

const importChatContacts = async ({
  payload,
  deadlineAtMs,
}: {
  payload: WhatsappImportChatContactsJobPayload;
  deadlineAtMs: number;
}): Promise<WhatsappHistoryImportChatJobResult> => {
  const { connectedAccountId, runId } = payload;
  const logPrefix = `[whatsapp] history run ${runId} conversation ${payload.chat.id}`;
  const skipChat = async (
    reason: string,
  ): Promise<WhatsappHistoryImportChatJobResult> => {
    console.log(`${logPrefix}: skipped, ${reason}`);

    await scheduleNextWhatsappHistoryImportContacts({
      connectedAccountId,
      runId,
      afterChatId: payload.chat.id,
    });

    const isActive = await finishWhatsappHistoryImportChat({
      connectedAccountId,
      runId,
      chatId: payload.chat.id,
      status: 'SKIPPED',
    });

    return { status: isActive ? 'SKIPPED' : 'CANCELLED' };
  };

  const settings = await getWhatsappSettings(connectedAccountId);

  if (!isWhatsappChatSelected({ settings, chatId: payload.chat.id })) {
    return skipChat('not selected');
  }

  const unipileAccountId = (await getConnection(connectedAccountId))
    .externalAccountId;
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account or message channel`,
    );
  }

  // Some listed conversations come without their participants
  const fetchedChat =
    getWhatsappChatCounterparts(payload.chat).length > 0
      ? payload.chat
      : await getUnipileChatIfExists({
          accountId: unipileAccountId,
          chatId: payload.chat.id,
        });

  if (!isDefined(fetchedChat)) {
    return skipChat('it no longer exists');
  }

  const chat = await withWhatsappGroupParticipants({
    unipileAccountId,
    chat: fetchedChat,
    deadlineAtMs,
  });
  const counterparts = toWhatsappCounterparts(
    getWhatsappChatCounterparts(chat),
  );

  if (counterparts.length === 0) {
    return skipChat('no participant has a visible phone number');
  }

  const chatPersons = await resolveWhatsappChatPersons({
    settings,
    counterparts,
    hasUserSentMessage: async () => {
      const { items } = await listUnipileChatMessagesPage({
        accountId: unipileAccountId,
        chatId: chat.id,
      });

      return mapWhatsappMessages({
        messages: items,
        channelHandle: channel.handle,
        counterparts,
      }).some(({ message }) => message.is_sender);
    },
    isGroupChat: isWhatsappGroupChat(chat),
  });

  if (!isDefined(chatPersons) || chatPersons.personIdByHandle.size === 0) {
    return skipChat('no contact to import it to');
  }

  await setWhatsappChatPersonAvatars({
    counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    deadlineAtMs,
  });

  console.log(
    `${logPrefix}: ${chatPersons.matchedPersonCount} people matched, ${chatPersons.createdPersonCount} people created`,
  );

  await scheduleNextWhatsappHistoryImportContacts({
    connectedAccountId,
    runId,
    afterChatId: chat.id,
  });

  const isScheduled = await scheduleWhatsappHistoryImportChatJob({
    job: {
      kind: 'MESSAGES',
      payload: {
        connectedAccountId,
        runId,
        chat,
        counterparts,
        personIdByHandle: Object.fromEntries(chatPersons.personIdByHandle),
        pageIndex: 0,
      },
    },
  });

  return { status: isScheduled ? 'CONTINUED' : 'CANCELLED' };
};

export const whatsappImportChatContactsHandler = async (
  payload: WhatsappImportChatContactsJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<WhatsappHistoryImportChatJobResult> => {
  const invokedAt = Date.now();

  if (!isDefined(await getActiveWhatsappHistoryImportState(payload))) {
    return { status: 'CANCELLED' };
  }

  try {
    return await importChatContacts({
      payload,
      deadlineAtMs:
        invokedAt +
        WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS * 1000 -
        WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    return handleWhatsappHistoryImportChatJobError({
      job: { kind: 'CONTACTS', payload },
      error,
      context,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-import-chat-contacts',
  description:
    'Matches or creates the people of one past WhatsApp conversation, queues the import of its messages when it has at least one person, then moves on to the next conversation.',
  timeoutSeconds: WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: whatsappImportChatContactsHandler,
});
