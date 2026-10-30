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

const failStalledPlanning = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinHistoryImportState | null> => {
  const planJobId =
    state.planJobId ??
    getLinkedinPlanHistoryImportJobId({ runId: state.runId });
  const planJob = (await getJobStatusesById([planJobId])).get(planJobId);

  if (isDefined(planJob) && planJob.state !== 'FAILED') {
    return null;
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
      ...latestState,
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

  const isPlanning = !isDefined(state.chunkCount);

  if (isPlanning) {
    const stalledState = await failStalledPlanning({
      connectedAccountId,
      state,
    });

    if (isDefined(stalledState)) {
      return stalledState;
    }
  }

  const knownChunkCount = state.chunkCount ?? state.plannedChunkCount ?? 0;
  const knownConversationCount = isPlanning
    ? (state.plannedConversationCount ?? 0)
    : (state.totalConversationCount ?? 0);
  const chunkJobIds = Array.from({ length: knownChunkCount }, (_, chunkIndex) =>
    getLinkedinImportHistoryJobId({ runId: state.runId, chunkIndex }),
  );
  const statusesById = await getJobStatusesById(chunkJobIds);
  const finishedChunkIndexes = chunkJobIds
    .map((jobId, chunkIndex) => ({ jobId, chunkIndex }))
    .filter(({ jobId }) => isJobFinished(statusesById.get(jobId)))
    .map(({ chunkIndex }) => chunkIndex);
  const runningChatCounts = await Promise.all(
    chunkJobIds
      .map((jobId, chunkIndex) => ({ jobId, chunkIndex }))
      .filter(({ jobId }) => statusesById.get(jobId)?.state === 'ACTIVE')
      .map(({ chunkIndex }) =>
        kv.get<number>(
          getLinkedinHistoryImportChunkKvKey({
            connectedAccountId,
            runId: state.runId,
            chunkIndex,
            kind: 'progress',
          }),
        ),
      ),
  );
  const processedConversationCount = Math.min(
    knownConversationCount,
    finishedChunkIndexes.length * LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB +
      runningChatCounts.reduce<number>(
        (total, chatCount) => total + (chatCount ?? 0),
        0,
      ),
  );
  const failedJob = chunkJobIds
    .map((jobId) => statusesById.get(jobId))
    .find((status) => status?.state === 'FAILED');

  if (
    !isDefined(failedJob) &&
    (isPlanning || finishedChunkIndexes.length < knownChunkCount)
  ) {
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
      chunkCount: knownChunkCount,
      status: isDefined(error) ? 'FAILED' : 'COMPLETED',
      importedConversationCount,
      processedConversationCount,
      finishedAt: new Date().toISOString(),
      ...(isDefined(error) ? { error } : {}),
    },
  });
};
