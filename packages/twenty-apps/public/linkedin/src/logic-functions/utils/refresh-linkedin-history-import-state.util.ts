import { getJobs, type JobStatusResult, kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/constants/enqueue-jobs-max-batch-size.constant';
import { LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/linkedin-history-import-chats-per-job.constant';
import { type LinkedinHistoryImportChunkResult } from 'src/logic-functions/types/linkedin-history-import-chunk-result.type';
import { deleteLinkedinHistoryImportChunkResults } from 'src/logic-functions/utils/delete-linkedin-history-import-chunk-results.util';
import { getLinkedinHistoryImportChunkKvKey } from 'src/logic-functions/utils/get-linkedin-history-import-chunk-kv-key.util';
import {
  getLinkedinImportHistoryJobId,
  getLinkedinPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const getJobStatusesById = async (
  jobIds: string[],
): Promise<Map<string, JobStatusResult>> => {
  const statuses: JobStatusResult[] = [];

  for (
    let batchStart = 0;
    batchStart < jobIds.length;
    batchStart += ENQUEUE_JOBS_MAX_BATCH_SIZE
  ) {
    statuses.push(
      ...(await getJobs(
        jobIds.slice(batchStart, batchStart + ENQUEUE_JOBS_MAX_BATCH_SIZE),
      )),
    );
  }

  return new Map(statuses.map((status) => [status.jobId, status]));
};

const isJobFinished = (status: JobStatusResult | undefined): boolean =>
  !isDefined(status) ||
  status.state === 'COMPLETED' ||
  status.state === 'FAILED';

const finishHistoryImport = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinHistoryImportState> => {
  await saveLinkedinHistoryImportState({ connectedAccountId, state });
  await deleteLinkedinHistoryImportChunkResults({ connectedAccountId, state });

  return state;
};

const refreshPlanningHistoryImport = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinHistoryImportState> => {
  const planJobId =
    state.planJobId ??
    getLinkedinPlanHistoryImportJobId({ runId: state.runId });
  const planJob = (await getJobStatusesById([planJobId])).get(planJobId);

  if (isDefined(planJob) && planJob.state !== 'FAILED') {
    return state;
  }

  const latestState = await getLinkedinHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.planJobId !== state.planJobId ||
    isDefined(latestState.chunkCount)
  ) {
    return latestState ?? state;
  }

  return finishHistoryImport({
    connectedAccountId,
    state: {
      ...state,
      status: 'FAILED',
      finishedAt: new Date().toISOString(),
      error: isDefined(planJob)
        ? { code: 'UNKNOWN', message: planJob.failedReason ?? '' }
        : { code: 'STALLED', message: 'The import stopped making progress.' },
    },
  });
};

export const refreshLinkedinHistoryImportState = async (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const { chunkCount, totalConversationCount } = state;

  if (!isDefined(chunkCount) || !isDefined(totalConversationCount)) {
    return refreshPlanningHistoryImport({ connectedAccountId, state });
  }

  const chunkJobIds = Array.from({ length: chunkCount }, (_, chunkIndex) =>
    getLinkedinImportHistoryJobId({ runId: state.runId, chunkIndex }),
  );
  const statusesById = await getJobStatusesById(chunkJobIds);
  const finishedChunkIndexes = chunkJobIds
    .map((jobId, chunkIndex) => ({ jobId, chunkIndex }))
    .filter(({ jobId }) => isJobFinished(statusesById.get(jobId)))
    .map(({ chunkIndex }) => chunkIndex);
  const processedConversationCount = Math.min(
    totalConversationCount,
    finishedChunkIndexes.length * LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
  );
  const failedJob = chunkJobIds
    .map((jobId) => statusesById.get(jobId))
    .find((status) => status?.state === 'FAILED');

  if (!isDefined(failedJob) && finishedChunkIndexes.length < chunkCount) {
    return { ...state, processedConversationCount };
  }

  const chunkResults = await Promise.all(
    finishedChunkIndexes.map((chunkIndex) =>
      kv.get<LinkedinHistoryImportChunkResult>(
        getLinkedinHistoryImportChunkKvKey({
          connectedAccountId,
          runId: state.runId,
          chunkIndex,
        }),
      ),
    ),
  );
  const importedConversationCount = chunkResults.reduce(
    (total, chunkResult) =>
      total + (chunkResult?.importedConversationCount ?? 0),
    0,
  );
  const error = isDefined(failedJob)
    ? (chunkResults.find((chunkResult) => isDefined(chunkResult?.error))
        ?.error ?? { code: 'UNKNOWN', message: failedJob.failedReason ?? '' })
    : undefined;

  return finishHistoryImport({
    connectedAccountId,
    state: {
      ...state,
      status: isDefined(error) ? 'FAILED' : 'COMPLETED',
      importedConversationCount,
      processedConversationCount,
      finishedAt: new Date().toISOString(),
      ...(isDefined(error) ? { error } : {}),
    },
  });
};
