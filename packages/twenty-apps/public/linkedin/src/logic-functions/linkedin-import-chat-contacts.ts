import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_HISTORY_IMPORT_DAILY_PROFILE_LOOKUP_LIMIT } from 'src/constants/linkedin-history-import-daily-profile-lookup-limit.constant';
import { LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS } from 'src/constants/linkedin-history-import-timeout-seconds.constant';
import { LINKEDIN_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinHistoryImportChatJobResult } from 'src/logic-functions/types/linkedin-history-import-chat-job-result.type';
import { type LinkedinImportChatContactsJobPayload } from 'src/logic-functions/types/linkedin-import-chat-contacts-job-payload.type';
import { createLinkedinCounterpartResolver } from 'src/logic-functions/utils/create-linkedin-counterpart-resolver.util';
import { finishLinkedinHistoryImportChat } from 'src/logic-functions/utils/finish-linkedin-history-import-chat.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { handleLinkedinHistoryImportChatJobError } from 'src/logic-functions/utils/handle-linkedin-history-import-chat-job-error.util';
import {
  isIngestableLinkedinMessage,
  resolveLinkedinChatPersons,
  setLinkedinChatPersonAvatars,
} from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { isLinkedinChatSelected } from 'src/logic-functions/utils/is-linkedin-chat-selected.util';
import { isLinkedinGroupChat } from 'src/logic-functions/utils/is-linkedin-group-chat.util';
import { scheduleLinkedinHistoryImportChatJob } from 'src/logic-functions/utils/schedule-linkedin-history-import-chat-job.util';
import { scheduleNextLinkedinHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-linkedin-history-import-contacts.util';
import { getUnipileChatIfExists } from 'src/unipile/utils/get-unipile-chat-if-exists.util';
import { listUnipileChatMessagesPage } from 'src/unipile/utils/list-unipile-chat-messages-page.util';

const importChatContacts = async ({
  payload,
  deadlineAtMs,
}: {
  payload: LinkedinImportChatContactsJobPayload;
  deadlineAtMs: number;
}): Promise<LinkedinHistoryImportChatJobResult> => {
  const { connectedAccountId, runId } = payload;
  const logPrefix = `[linkedin] history run ${runId} conversation ${payload.chat.id}`;
  const skipChat = async (
    reason: string,
  ): Promise<LinkedinHistoryImportChatJobResult> => {
    console.log(`${logPrefix}: skipped, ${reason}`);

    await scheduleNextLinkedinHistoryImportContacts({
      connectedAccountId,
      runId,
      afterChatId: payload.chat.id,
    });

    const isActive = await finishLinkedinHistoryImportChat({
      connectedAccountId,
      runId,
      chatId: payload.chat.id,
      status: 'SKIPPED',
    });

    return { status: isActive ? 'SKIPPED' : 'CANCELLED' };
  };

  const settings = await getLinkedinSettings(connectedAccountId);

  if (!isLinkedinChatSelected({ settings, chatId: payload.chat.id })) {
    return skipChat('not selected');
  }

  const unipileAccountId = (await getConnection(connectedAccountId))
    .externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  // Some listed conversations come without their participants
  const chat =
    getLinkedinChatCounterparts(payload.chat).length > 0
      ? payload.chat
      : await getUnipileChatIfExists({
          accountId: unipileAccountId,
          chatId: payload.chat.id,
        });

  if (!isDefined(chat)) {
    return skipChat('it no longer exists');
  }

  const chatPersons = await resolveLinkedinChatPersons({
    settings,
    counterparts: getLinkedinChatCounterparts(chat),
    resolveCounterpart: createLinkedinCounterpartResolver(unipileAccountId, {
      dailyLookupLimit: LINKEDIN_HISTORY_IMPORT_DAILY_PROFILE_LOOKUP_LIMIT,
      deadlineAtMs,
    }),
    hasUserSentMessage: async () => {
      const { items } = await listUnipileChatMessagesPage({
        accountId: unipileAccountId,
        chatId: chat.id,
      });

      return items.some(
        (message) => isIngestableLinkedinMessage(message) && message.is_sender,
      );
    },
    isGroupChat: isLinkedinGroupChat(chat),
  });

  if (!isDefined(chatPersons) || chatPersons.personIdByHandle.size === 0) {
    return skipChat('no contact to import it to');
  }

  await setLinkedinChatPersonAvatars({
    counterparts: chatPersons.counterparts,
    personIdByHandle: chatPersons.personIdByHandle,
    deadlineAtMs,
  });

  console.log(
    `${logPrefix}: ${chatPersons.matchedPersonCount} people matched, ${chatPersons.createdPersonCount} people created`,
  );

  await scheduleNextLinkedinHistoryImportContacts({
    connectedAccountId,
    runId,
    afterChatId: chat.id,
  });

  const isScheduled = await scheduleLinkedinHistoryImportChatJob({
    job: {
      kind: 'MESSAGES',
      payload: {
        connectedAccountId,
        runId,
        chat,
        counterparts: chatPersons.counterparts,
        personIdByHandle: Object.fromEntries(chatPersons.personIdByHandle),
        pageIndex: 0,
      },
    },
  });

  return { status: isScheduled ? 'CONTINUED' : 'CANCELLED' };
};

export const linkedinImportChatContactsHandler = async (
  payload: LinkedinImportChatContactsJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinHistoryImportChatJobResult> => {
  const invokedAt = Date.now();

  if (!isDefined(await getActiveLinkedinHistoryImportState(payload))) {
    return { status: 'CANCELLED' };
  }

  try {
    return await importChatContacts({
      payload,
      deadlineAtMs:
        invokedAt +
        LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS * 1000 -
        LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    return handleLinkedinHistoryImportChatJobError({
      job: { kind: 'CONTACTS', payload },
      error,
      context,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_CHAT_CONTACTS_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-chat-contacts',
  description:
    'Matches or creates the people of one past LinkedIn conversation, queues the import of its messages when it has at least one person, then moves on to the next conversation.',
  timeoutSeconds: LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS,
  handler: linkedinImportChatContactsHandler,
});
