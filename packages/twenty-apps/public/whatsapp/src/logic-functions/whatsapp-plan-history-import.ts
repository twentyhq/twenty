import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  getConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_CHAT_OPTIONS_MAX_COUNT } from 'src/constants/whatsapp-chat-options-max-count.constant';
import { WHATSAPP_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/whatsapp-history-import-chats-per-job.constant';
import { WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/whatsapp-import-history-timeout-seconds.constant';
import { WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type WhatsappPlanHistoryImportJobPayload } from 'src/logic-functions/types/whatsapp-plan-history-import-job-payload.type';
import { enqueueWhatsappImportHistoryJob } from 'src/logic-functions/utils/enqueue-whatsapp-import-history-job.util';
import { failWhatsappHistoryImportJob } from 'src/logic-functions/utils/fail-whatsapp-history-import-job.util';
import { getActiveWhatsappHistoryImportState } from 'src/logic-functions/utils/get-active-whatsapp-history-import-state.util';
import { getWhatsappPlanHistoryImportJobId } from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import {
  getWhatsappHistoryImportPlanning,
  getWhatsappHistoryImportProgress,
  saveWhatsappHistoryImportChunkChats,
  saveWhatsappHistoryImportPlanning,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { orderSelectedWhatsappChatsByRecency } from 'src/logic-functions/utils/order-selected-whatsapp-chats-by-recency.util';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';
import { listMostRecentUnipileChats } from 'src/unipile/utils/list-most-recent-unipile-chats.util';

const WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

const WHATSAPP_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS = 10 * 60 * 1000;

type WhatsappPlanHistoryImportResult = {
  status: 'CANCELLED' | 'CONTINUED' | 'PLANNED';
  chunkCount?: number;
};

const getCurrentPlanJobId = ({
  runId,
  continuationIndex,
}: WhatsappPlanHistoryImportJobPayload): string =>
  getWhatsappPlanHistoryImportJobId({ runId, continuationIndex });

const retryPlanningLater = async (
  {
    connectedAccountId,
    runId,
    continuationIndex,
  }: WhatsappPlanHistoryImportJobPayload,
  delayMs: number,
): Promise<WhatsappPlanHistoryImportResult> => {
  const payload = {
    connectedAccountId,
    runId,
    continuationIndex: (continuationIndex ?? 0) + 1,
  };

  if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  const planJobId = getCurrentPlanJobId(payload);

  await saveWhatsappHistoryImportPlanning({
    ...payload,
    planning: {
      plannedChunkCount: 0,
      plannedConversationCount: 0,
      planJobId,
      resumeAt: new Date(Date.now() + delayMs).toISOString(),
    },
  });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      WHATSAPP_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: planJobId, payload }],
    retryLimit: WHATSAPP_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
    delayMs,
  });

  return { status: 'CONTINUED' };
};

const planChunk = async ({
  payload,
  chunkIndex,
  chats,
  conversationCount,
  reportedConversationCount,
}: {
  payload: WhatsappPlanHistoryImportJobPayload;
  chunkIndex: number;
  chats: UnipileChat[];
  conversationCount: number;
  reportedConversationCount: number;
}): Promise<boolean> => {
  const { connectedAccountId, runId } = payload;

  if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
    return false;
  }

  await saveWhatsappHistoryImportChunkChats({
    connectedAccountId,
    runId,
    chunkIndex,
    chats,
  });
  await saveWhatsappHistoryImportPlanning({
    connectedAccountId,
    runId,
    planning: {
      plannedChunkCount: chunkIndex + 1,
      plannedConversationCount: conversationCount,
      reportedConversationCount,
      planJobId: getCurrentPlanJobId(payload),
    },
  });

  const { completedChunkCount } =
    await getWhatsappHistoryImportProgress(payload);

  if (completedChunkCount === chunkIndex) {
    await enqueueWhatsappImportHistoryJob({
      connectedAccountId,
      runId,
      chunkIndex,
    });
  }

  return true;
};

const planHistoryImport = async ({
  payload,
  importPolicy,
  conversationLimit,
}: {
  payload: WhatsappPlanHistoryImportJobPayload;
  importPolicy: WhatsappImportPolicy;
  conversationLimit: number;
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
    const deadlineAtMs =
      Date.now() + WHATSAPP_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS;

    chats =
      importPolicy === 'SELECTED'
        ? orderSelectedWhatsappChatsByRecency({
            selectedChats: (await getWhatsappSettings(connectedAccountId))
              .selectedChats,
            recentChats: await listMostRecentUnipileChats({
              accountId: unipileAccountId,
              limit: WHATSAPP_CHAT_OPTIONS_MAX_COUNT,
              deadlineAtMs,
            }),
          })
        : await listMostRecentUnipileChats({
            accountId: unipileAccountId,
            limit: conversationLimit,
            deadlineAtMs,
          });
  } catch (error) {
    if (!(error instanceof UnipileRateLimitError)) {
      throw error;
    }

    console.log(
      `[whatsapp] history run ${runId}: listing paused for ${error.retryAfterSeconds}s: ${error.message}`,
    );

    return retryPlanningLater(payload, error.retryAfterSeconds * 1000);
  }

  let chunkCount = 0;

  for (
    let chunkStart = 0;
    chunkStart < chats.length;
    chunkStart += WHATSAPP_HISTORY_IMPORT_CHATS_PER_JOB
  ) {
    const chunkChats = chats.slice(
      chunkStart,
      chunkStart + WHATSAPP_HISTORY_IMPORT_CHATS_PER_JOB,
    );

    if (
      !(await planChunk({
        payload,
        chunkIndex: chunkCount,
        chats: chunkChats,
        conversationCount: chunkStart + chunkChats.length,
        reportedConversationCount: chats.length,
      }))
    ) {
      return { status: 'CANCELLED' };
    }

    chunkCount += 1;
  }

  if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  await saveWhatsappHistoryImportPlanning({
    ...payload,
    planning: {
      plannedChunkCount: chunkCount,
      plannedConversationCount: chats.length,
      reportedConversationCount: chats.length,
      chunkCount,
      planJobId: getCurrentPlanJobId(payload),
    },
  });

  console.log(
    `[whatsapp] history run ${runId}: listing done, ${chats.length} conversations in ${chunkCount} pages`,
  );

  return { status: 'PLANNED', chunkCount };
};

export const whatsappPlanHistoryImportHandler = async (
  payload: WhatsappPlanHistoryImportJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<WhatsappPlanHistoryImportResult> => {
  const state = await getActiveWhatsappHistoryImportState(payload);

  if (state === null) {
    return { status: 'CANCELLED' };
  }

  try {
    return await planHistoryImport({
      payload,
      importPolicy: state.importPolicy,
      conversationLimit: state.conversationLimit,
    });
  } catch (error) {
    return failWhatsappHistoryImportJob({
      error,
      context,
      onFinalFailure: async (importError) => {
        if ((await getActiveWhatsappHistoryImportState(payload)) === null) {
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
    'Lists the past WhatsApp conversations of a connection to import, most recent first, and starts their import.',
  timeoutSeconds: WHATSAPP_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: whatsappPlanHistoryImportHandler,
});
