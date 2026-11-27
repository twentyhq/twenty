import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  getConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/whatsapp-attachment-deadline-margin-milliseconds.constant';
import { WHATSAPP_CHAT_OPTIONS_MAX_COUNT } from 'src/constants/whatsapp-chat-options-max-count.constant';
import { WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/whatsapp-import-history-timeout-seconds.constant';
import { WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappPlanHistoryImportJobPayload } from 'src/logic-functions/types/whatsapp-plan-history-import-job-payload.type';
import { failWhatsappHistoryImportJob } from 'src/logic-functions/utils/fail-whatsapp-history-import-job.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { getWhatsappPlanHistoryImportJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import {
  getWhatsappHistoryImportPlanning,
  saveWhatsappHistoryImportChatProgress,
  saveWhatsappHistoryImportPlanning,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { scheduleNextWhatsappHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-whatsapp-history-import-contacts.util';
import { orderSelectedWhatsappChatsByRecency } from 'src/logic-functions/utils/order-selected-whatsapp-chats-by-recency.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listMostRecentUnipileChats } from 'src/unipile/utils/list-most-recent-unipile-chats.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

const WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

type WhatsappPlanHistoryImportResult = {
  status: 'CANCELLED' | 'PAUSED' | 'PLANNED';
  conversationCount?: number;
};

const pausePlanning = async ({
  payload,
  delayMs,
}: {
  payload: WhatsappPlanHistoryImportJobPayload;
  delayMs: number;
}): Promise<WhatsappPlanHistoryImportResult> => {
  const nextPayload = {
    ...payload,
    continuationIndex: (payload.continuationIndex ?? 0) + 1,
  };
  const planJobId = getWhatsappPlanHistoryImportJobId(nextPayload);

  await saveWhatsappHistoryImportPlanning({
    ...payload,
    planning: {
      planJobId,
      resumeAt: new Date(Date.now() + delayMs).toISOString(),
    },
  });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: planJobId, payload: nextPayload }],
    retryLimit: WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
    delayMs,
  });

  return { status: 'PAUSED' };
};

const listChatsToImport = async ({
  connectedAccountId,
  unipileAccountId,
  state,
  deadlineAtMs,
}: {
  connectedAccountId: string;
  unipileAccountId: string;
  state: Pick<WhatsappHistoryImportState, 'importPolicy' | 'conversationLimit'>;
  deadlineAtMs: number;
}): Promise<UnipileChat[]> => {
  if (state.importPolicy !== 'SELECTED') {
    return listMostRecentUnipileChats({
      accountId: unipileAccountId,
      limit: state.conversationLimit,
      deadlineAtMs,
    });
  }

  const { selectedChats } = await getWhatsappSettings(connectedAccountId);
  const recentChats = await listMostRecentUnipileChats({
    accountId: unipileAccountId,
    limit: WHATSAPP_CHAT_OPTIONS_MAX_COUNT,
    deadlineAtMs,
  });

  return orderSelectedWhatsappChatsByRecency({ selectedChats, recentChats });
};

const planHistoryImport = async ({
  payload,
  state,
  invokedAt,
}: {
  payload: WhatsappPlanHistoryImportJobPayload;
  state: WhatsappHistoryImportState;
  invokedAt: number;
}): Promise<WhatsappPlanHistoryImportResult> => {
  const { connectedAccountId, runId } = payload;
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account`,
    );
  }

  let chats: UnipileChat[];

  try {
    chats = await listChatsToImport({
      connectedAccountId,
      unipileAccountId,
      state,
      deadlineAtMs:
        invokedAt +
        WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS * 1000 -
        WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    if (!(error instanceof UnipileRateLimitError)) {
      throw error;
    }

    console.log(
      `[whatsapp] history run ${runId}: listing paused for ${error.retryAfterSeconds}s: ${error.message}`,
    );

    return pausePlanning({ payload, delayMs: error.retryAfterSeconds * 1000 });
  }

  if (!isDefined(await getActiveWhatsappHistoryImportState(payload))) {
    return { status: 'CANCELLED' };
  }

  await Promise.all(
    chats.map((chat) =>
      saveWhatsappHistoryImportChatProgress({
        connectedAccountId,
        runId,
        chatId: chat.id,
        progress: { status: 'PENDING', chat },
      }),
    ),
  );
  await saveWhatsappHistoryImportPlanning({
    ...payload,
    planning: {
      chatIds: chats.map((chat) => chat.id),
      planJobId: getWhatsappPlanHistoryImportJobId(payload),
    },
  });
  await scheduleNextWhatsappHistoryImportContacts({
    connectedAccountId,
    runId,
  });

  console.log(
    `[whatsapp] history run ${runId}: ${chats.length} conversations listed (last messages ${chats[0]?.last_message_timestamp ?? '-'} to ${chats[chats.length - 1]?.last_message_timestamp ?? '-'})`,
  );

  return { status: 'PLANNED', conversationCount: chats.length };
};

export const whatsappPlanHistoryImportHandler = async (
  payload: WhatsappPlanHistoryImportJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<WhatsappPlanHistoryImportResult> => {
  const invokedAt = Date.now();
  const state = await getActiveWhatsappHistoryImportState(payload);

  if (!isDefined(state)) {
    return { status: 'CANCELLED' };
  }

  try {
    return await planHistoryImport({ payload, state, invokedAt });
  } catch (error) {
    return failWhatsappHistoryImportJob({
      error,
      context,
      onFinalFailure: async (importError) => {
        if (!isDefined(await getActiveWhatsappHistoryImportState(payload))) {
          return;
        }

        await saveWhatsappHistoryImportPlanning({
          ...payload,
          planning: {
            ...(await getWhatsappHistoryImportPlanning(payload)),
            error: importError,
          },
        });
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-plan-history-import',
  description:
    'Lists the past WhatsApp conversations of a connection, most recent first, and starts importing their contacts one conversation after another.',
  timeoutSeconds: WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: whatsappPlanHistoryImportHandler,
});
