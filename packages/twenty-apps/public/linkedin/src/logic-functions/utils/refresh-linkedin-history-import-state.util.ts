import { getJobs } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import {
  getLinkedinImportHistoryJobId,
  getLinkedinPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import {
  deleteLinkedinHistoryImportData,
  getLinkedinHistoryImportProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const finishLinkedinHistoryImport = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinHistoryImportState> => {
  await saveLinkedinHistoryImportState({ connectedAccountId, state });
  await deleteLinkedinHistoryImportData({
    connectedAccountId,
    runId: state.runId,
    chunkCount: state.chunkCount ?? state.plannedChunkCount ?? 0,
  });

  return state;
};

const getJobStatus = async (jobId: string) =>
  (await getJobs([jobId])).find((status) => status.jobId === jobId);

const getPlanningFailure = async (
  state: LinkedinHistoryImportState,
): Promise<LinkedinHistoryImportState['error']> => {
  if (isDefined(state.chunkCount)) {
    return undefined;
  }

  const planJob = await getJobStatus(
    state.planJobId ??
      getLinkedinPlanHistoryImportJobId({ runId: state.runId }),
  );

  if (!isDefined(planJob)) {
    return { code: 'STALLED', message: 'The import stopped making progress.' };
  }

  return planJob.state === 'FAILED'
    ? { code: 'UNKNOWN', message: planJob.failedReason ?? '' }
    : undefined;
};

export const refreshLinkedinHistoryImportState = async (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const run = { connectedAccountId, runId: state.runId };
  const progress = await getLinkedinHistoryImportProgress(run);
  const processedConversationCount =
    progress.completedConversationCount + progress.currentChunkProcessedCount;
  const currentState: LinkedinHistoryImportState = {
    ...state,
    importedConversationCount: progress.importedConversationCount,
    processedConversationCount,
  };

  const isImportDone =
    isDefined(state.chunkCount) &&
    progress.completedChunkCount >= state.chunkCount;

  if (isImportDone) {
    return finishLinkedinHistoryImport({
      connectedAccountId,
      state: {
        ...currentState,
        status: 'COMPLETED',
        finishedAt: new Date().toISOString(),
      },
    });
  }

  const hasPlannedCurrentChunk =
    (state.plannedChunkCount ?? 0) > progress.completedChunkCount;
  const currentChunkJob = hasPlannedCurrentChunk
    ? await getJobStatus(
        getLinkedinImportHistoryJobId({
          runId: state.runId,
          chunkIndex: progress.completedChunkCount,
        }),
      )
    : undefined;
  const error =
    progress.error ??
    (currentChunkJob?.state === 'FAILED'
      ? {
          code: 'UNKNOWN' as const,
          message: currentChunkJob.failedReason ?? '',
        }
      : await getPlanningFailure(state));

  if (!isDefined(error)) {
    return currentState;
  }

  const latestState = await getLinkedinHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.status !== 'IMPORTING' ||
    latestState.planJobId !== state.planJobId ||
    latestState.chunkCount !== state.chunkCount
  ) {
    return latestState;
  }

  return finishLinkedinHistoryImport({
    connectedAccountId,
    state: {
      ...currentState,
      status: 'FAILED',
      finishedAt: new Date().toISOString(),
      error,
    },
  });
};
