import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_CHAT_OPTIONS_MAX_COUNT } from 'src/constants/linkedin-chat-options-max-count.constant';
import { LINKEDIN_HISTORY_CONVERSATION_LIMIT } from 'src/constants/linkedin-history-conversation-limit.constant';
import { LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS } from 'src/constants/linkedin-history-import-timeout-seconds.constant';
import { LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinPlanHistoryImportJobPayload } from 'src/logic-functions/types/linkedin-plan-history-import-job-payload.type';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinPlanHistoryImportJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import {
  getLinkedinHistoryImportPlanning,
  saveLinkedinHistoryImportChatProgress,
  saveLinkedinHistoryImportPlanning,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { scheduleNextLinkedinHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-linkedin-history-import-contacts.util';
import { orderSelectedLinkedinChatsByRecency } from 'src/logic-functions/utils/order-selected-linkedin-chats-by-recency.util';
import { setLinkedinAccountOwnerAvatar } from 'src/logic-functions/utils/set-linkedin-account-owner-avatar.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listMostRecentUnipileChats } from 'src/unipile/utils/list-most-recent-unipile-chats.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

type LinkedinPlanHistoryImportResult = {
  status: 'CANCELLED' | 'PAUSED' | 'PLANNED';
  conversationCount?: number;
};

const pausePlanning = async ({
  payload,
  delayMs,
}: {
  payload: LinkedinPlanHistoryImportJobPayload;
  delayMs: number;
}): Promise<LinkedinPlanHistoryImportResult> => {
  const nextPayload = {
    ...payload,
    continuationIndex: (payload.continuationIndex ?? 0) + 1,
  };
  const planJobId = getLinkedinPlanHistoryImportJobId(nextPayload);

  await saveLinkedinHistoryImportPlanning({
    ...payload,
    planning: {
      planJobId,
      resumeAt: new Date(Date.now() + delayMs).toISOString(),
    },
  });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: planJobId, payload: nextPayload }],
    retryLimit: LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
    delayMs,
  });

  return { status: 'PAUSED' };
};

const listChatsToImport = async ({
  connectedAccountId,
  unipileAccountId,
  state,
}: {
  connectedAccountId: string;
  unipileAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<UnipileChat[]> => {
  const inboxIds = await listUnipileInboxIds(unipileAccountId);

  if (state.importPolicy !== 'SELECTED') {
    return listMostRecentUnipileChats({
      accountId: unipileAccountId,
      inboxIds,
      limit: state.conversationLimit ?? LINKEDIN_HISTORY_CONVERSATION_LIMIT,
    });
  }

  const { selectedChats } = await getLinkedinSettings(connectedAccountId);
  const recentChats = await listMostRecentUnipileChats({
    accountId: unipileAccountId,
    inboxIds,
    limit: LINKEDIN_CHAT_OPTIONS_MAX_COUNT,
  });

  return orderSelectedLinkedinChatsByRecency({ selectedChats, recentChats });
};

const planHistoryImport = async ({
  payload,
  state,
  invokedAt,
}: {
  payload: LinkedinPlanHistoryImportJobPayload;
  state: LinkedinHistoryImportState;
  invokedAt: number;
}): Promise<LinkedinPlanHistoryImportResult> => {
  const { connectedAccountId, runId } = payload;
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account or message channel`,
    );
  }

  if (!isDefined(payload.continuationIndex)) {
    await setLinkedinAccountOwnerAvatar({
      unipileAccountId,
      channelHandle: channel.handle,
      deadlineAtMs:
        invokedAt +
        LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS * 1000 -
        LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  }

  let chats: UnipileChat[];

  try {
    chats = await listChatsToImport({
      connectedAccountId,
      unipileAccountId,
      state,
    });
  } catch (error) {
    if (!(error instanceof UnipileRateLimitError)) {
      throw error;
    }

    console.log(
      `[linkedin] history run ${runId}: listing paused for ${error.retryAfterSeconds}s: ${error.message}`,
    );

    return pausePlanning({ payload, delayMs: error.retryAfterSeconds * 1000 });
  }

  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  await Promise.all(
    chats.map((chat) =>
      saveLinkedinHistoryImportChatProgress({
        connectedAccountId,
        runId,
        chatId: chat.id,
        progress: { status: 'PENDING', chat },
      }),
    ),
  );
  await saveLinkedinHistoryImportPlanning({
    ...payload,
    planning: {
      chatIds: chats.map((chat) => chat.id),
      planJobId: getLinkedinPlanHistoryImportJobId(payload),
    },
  });
  await scheduleNextLinkedinHistoryImportContacts({
    connectedAccountId,
    runId,
  });

  console.log(
    `[linkedin] history run ${runId}: ${chats.length} conversations listed (last messages ${chats[0]?.last_message_timestamp ?? '-'} to ${chats[chats.length - 1]?.last_message_timestamp ?? '-'})`,
  );

  return { status: 'PLANNED', conversationCount: chats.length };
};

export const linkedinPlanHistoryImportHandler = async (
  payload: LinkedinPlanHistoryImportJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinPlanHistoryImportResult> => {
  const invokedAt = Date.now();
  const state = await getActiveLinkedinHistoryImportState(payload);

  if (state === null) {
    return { status: 'CANCELLED' };
  }

  try {
    return await planHistoryImport({ payload, state, invokedAt });
  } catch (error) {
    return failLinkedinHistoryImportJob({
      error,
      context,
      onFinalFailure: async (importError) => {
        if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
          return;
        }

        await saveLinkedinHistoryImportPlanning({
          ...payload,
          planning: {
            ...(await getLinkedinHistoryImportPlanning(payload)),
            error: importError,
          },
        });
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-plan-history-import',
  description:
    'Lists the past LinkedIn conversations of a connection, most recent first, and starts importing their contacts one conversation after another.',
  timeoutSeconds: LINKEDIN_HISTORY_IMPORT_TIMEOUT_SECONDS,
  handler: linkedinPlanHistoryImportHandler,
});
