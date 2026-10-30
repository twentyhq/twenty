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
import { getLinkedinImportHistoryJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { listUnipileChatIds } from 'src/unipile/utils/list-unipile-chat-ids.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';

const LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT = 3;

type LinkedinPlanHistoryImportResult = {
  status: 'CANCELLED' | 'PLANNED';
  chunkCount?: number;
};

const splitIntoChunks = <TItem>(items: TItem[], size: number): TItem[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );

const planHistoryImport = async ({
  connectedAccountId,
  runId,
}: LinkedinPlanHistoryImportJobPayload): Promise<LinkedinPlanHistoryImportResult> => {
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  const chatIds = await listUnipileChatIds({
    accountId: unipileAccountId,
    inboxIds: await listUnipileInboxIds(unipileAccountId),
  });
  const jobs = splitIntoChunks(
    chatIds,
    LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
  ).map((chunkChatIds, chunkIndex) => ({
    jobId: getLinkedinImportHistoryJobId({ runId, chunkIndex }),
    payload: {
      connectedAccountId,
      runId,
      chunkIndex,
      chatIds: chunkChatIds,
    } satisfies LinkedinImportHistoryJobPayload,
  }));

  for (const jobBatch of splitIntoChunks(jobs, ENQUEUE_JOBS_MAX_BATCH_SIZE)) {
    if (
      (await getActiveLinkedinHistoryImportState({
        connectedAccountId,
        runId,
      })) === null
    ) {
      return { status: 'CANCELLED' };
    }

    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
      jobs: jobBatch,
      retryLimit: LINKEDIN_IMPORT_HISTORY_RETRY_LIMIT,
    });
  }

  const state = await getActiveLinkedinHistoryImportState({
    connectedAccountId,
    runId,
  });

  if (state === null) {
    return { status: 'CANCELLED' };
  }

  await saveLinkedinHistoryImportState({
    connectedAccountId,
    state: {
      ...state,
      totalConversationCount: chatIds.length,
      chunkCount: jobs.length,
      ...(jobs.length === 0
        ? { status: 'COMPLETED', finishedAt: new Date().toISOString() }
        : {}),
    },
  });

  return { status: 'PLANNED', chunkCount: jobs.length };
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
    'Lists the past LinkedIn conversations of a connection, most recent first, and queues one import job per chunk of conversations.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinPlanHistoryImportHandler,
});
