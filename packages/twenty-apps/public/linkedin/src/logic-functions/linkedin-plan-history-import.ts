import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  getConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';
import { LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/linkedin-history-import-chats-per-job.constant';
import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import {
  LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { type LinkedinPlanHistoryImportJobPayload } from 'src/logic-functions/types/linkedin-plan-history-import-job-payload.type';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import {
  getLinkedinImportHistoryJobId,
  getLinkedinPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';

const LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT = 3;

const LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

const LINKEDIN_PLAN_HISTORY_IMPORT_FLUSH_CHUNK_COUNT = 10;

const LINKEDIN_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS = 10 * 60 * 1000;

type LinkedinPlanHistoryImportResult = {
  status: 'CANCELLED' | 'CONTINUED' | 'PLANNED';
  chunkCount?: number;
};

type LinkedinImportHistoryJob = {
  jobId: string;
  payload: LinkedinImportHistoryJobPayload;
};

const isRunActive = async (
  payload: LinkedinPlanHistoryImportJobPayload,
): Promise<boolean> =>
  (await getActiveLinkedinHistoryImportState(payload)) !== null;

const enqueueImportHistoryJobs = async (
  jobs: LinkedinImportHistoryJob[],
): Promise<void> => {
  for (
    let batchStart = 0;
    batchStart < jobs.length;
    batchStart += ENQUEUE_JOBS_MAX_BATCH_SIZE
  ) {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
      jobs: jobs.slice(batchStart, batchStart + ENQUEUE_JOBS_MAX_BATCH_SIZE),
      retryLimit: LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT,
    });
  }
};

const continuePlanning = async (
  payload: LinkedinPlanHistoryImportJobPayload,
): Promise<LinkedinPlanHistoryImportResult> => {
  const state = await getActiveLinkedinHistoryImportState(payload);

  if (state === null) {
    return { status: 'CANCELLED' };
  }

  const planJobId = getLinkedinPlanHistoryImportJobId({
    runId: payload.runId,
    continuationIndex: payload.continuationIndex,
  });

  await saveLinkedinHistoryImportState({
    connectedAccountId: payload.connectedAccountId,
    state: { ...state, planJobId },
  });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: planJobId, payload }],
    retryLimit: LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
  });

  return { status: 'CONTINUED' };
};

const finishPlanning = async ({
  payload,
  chunkCount,
  conversationCount,
}: {
  payload: LinkedinPlanHistoryImportJobPayload;
  chunkCount: number;
  conversationCount: number;
}): Promise<LinkedinPlanHistoryImportResult> => {
  const state = await getActiveLinkedinHistoryImportState(payload);

  if (state === null) {
    return { status: 'CANCELLED' };
  }

  await saveLinkedinHistoryImportState({
    connectedAccountId: payload.connectedAccountId,
    state: {
      ...state,
      totalConversationCount: conversationCount,
      chunkCount,
      ...(chunkCount === 0
        ? { status: 'COMPLETED', finishedAt: new Date().toISOString() }
        : {}),
    },
  });

  return { status: 'PLANNED', chunkCount };
};

const planHistoryImport = async (
  payload: LinkedinPlanHistoryImportJobPayload,
): Promise<LinkedinPlanHistoryImportResult> => {
  const { connectedAccountId, runId } = payload;
  const startedAt = Date.now();
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const inboxIds = await listUnipileInboxIds(unipileAccountId);
  let inboxIndex = payload.inboxIndex ?? 0;
  let cursor = payload.cursor;
  let chunkCount = payload.plannedChunkCount ?? 0;
  let conversationCount = payload.plannedConversationCount ?? 0;
  let pendingJobs: LinkedinImportHistoryJob[] = [];

  const flushPendingJobs = async (): Promise<boolean> => {
    if (!(await isRunActive(payload))) {
      return false;
    }

    await enqueueImportHistoryJobs(pendingJobs);
    pendingJobs = [];

    return true;
  };

  while (inboxIndex < inboxIds.length) {
    if (
      Date.now() - startedAt >
      LINKEDIN_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS
    ) {
      if (!(await flushPendingJobs())) {
        return { status: 'CANCELLED' };
      }

      return continuePlanning({
        connectedAccountId,
        runId,
        continuationIndex: (payload.continuationIndex ?? 0) + 1,
        inboxIndex,
        cursor,
        plannedChunkCount: chunkCount,
        plannedConversationCount: conversationCount,
      });
    }

    const page = await listUnipileChats({
      accountId: unipileAccountId,
      inboxId: inboxIds[inboxIndex],
      cursor,
      limit: LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
    });

    if (page.items.length > 0) {
      pendingJobs.push({
        jobId: getLinkedinImportHistoryJobId({ runId, chunkIndex: chunkCount }),
        payload: {
          connectedAccountId,
          runId,
          chunkIndex: chunkCount,
          chatIds: page.items.map((chat) => chat.id),
        },
      });
      chunkCount += 1;
      conversationCount += page.items.length;
    }

    if (
      page.items.length === 0 ||
      !isNonEmptyString(page.nextCursor) ||
      page.nextCursor === cursor
    ) {
      inboxIndex += 1;
      cursor = undefined;
    } else {
      cursor = page.nextCursor;
    }

    if (
      pendingJobs.length >= LINKEDIN_PLAN_HISTORY_IMPORT_FLUSH_CHUNK_COUNT &&
      !(await flushPendingJobs())
    ) {
      return { status: 'CANCELLED' };
    }
  }

  if (!(await flushPendingJobs())) {
    return { status: 'CANCELLED' };
  }

  return finishPlanning({ payload, chunkCount, conversationCount });
};

export const linkedinPlanHistoryImportHandler = async (
  payload: LinkedinPlanHistoryImportJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinPlanHistoryImportResult> => {
  if ((await getActiveLinkedinHistoryImportState(payload)) === null) {
    return { status: 'CANCELLED' };
  }

  try {
    return await planHistoryImport(payload);
  } catch (error) {
    return failLinkedinHistoryImportJob({
      error,
      context,
      onFinalFailure: async (importError) => {
        const state = await getActiveLinkedinHistoryImportState(payload);

        if (state !== null) {
          await saveLinkedinHistoryImportState({
            connectedAccountId: payload.connectedAccountId,
            state: {
              ...state,
              status: 'FAILED',
              finishedAt: new Date().toISOString(),
              error: importError,
            },
          });
        }
      },
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-plan-history-import',
  description:
    'Lists the past LinkedIn conversations of a connection, most recent first, queues one import job per chunk of conversations in bulk and hands over to a new planning job when its time runs out.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinPlanHistoryImportHandler,
});
