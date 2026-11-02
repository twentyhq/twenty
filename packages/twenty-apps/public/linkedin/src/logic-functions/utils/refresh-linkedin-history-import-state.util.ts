import { getJobs, type JobStatusResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinHistoryImportPlanning } from 'src/logic-functions/types/linkedin-history-import-planning.type';
import { type LinkedinHistoryImportProgress } from 'src/logic-functions/types/linkedin-history-import-progress.type';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import {
  getLinkedinImportHistoryJobId,
  getLinkedinPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import {
  deleteLinkedinHistoryImportData,
  getLinkedinHistoryImportPlanning,
  getLinkedinHistoryImportProgress,
  saveLinkedinHistoryImportProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const LINKEDIN_HISTORY_IMPORT_MAX_RECOVERIES = 3;

const STALLED_ERROR = {
  code: 'STALLED' as const,
  message: 'The import stopped making progress.',
};

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
  });

  return state;
};

const getJobStatus = async (
  jobId: string,
): Promise<JobStatusResult | undefined> =>
  (await getJobs([jobId])).find((status) => status.jobId === jobId);

const getPlanningError = async (
  planning: LinkedinHistoryImportPlanning,
  runId: string,
): Promise<LinkedinHistoryImportState['error']> => {
  if (isDefined(planning.error)) {
    return planning.error;
  }

  if (isDefined(planning.chunkCount)) {
    return undefined;
  }

  const planJob = await getJobStatus(
    planning.planJobId ?? getLinkedinPlanHistoryImportJobId({ runId }),
  );

  if (!isDefined(planJob)) {
    return STALLED_ERROR;
  }

  return planJob.state === 'FAILED'
    ? { code: 'UNKNOWN', message: planJob.failedReason ?? '' }
    : undefined;
};

const getCurrentChunkError = async ({
  connectedAccountId,
  runId,
  planning,
  progress,
}: {
  connectedAccountId: string;
  runId: string;
  planning: LinkedinHistoryImportPlanning;
  progress: LinkedinHistoryImportProgress;
}): Promise<LinkedinHistoryImportState['error']> => {
  if (isDefined(progress.error)) {
    return progress.error;
  }

  const chunkIndex = progress.completedChunkCount;

  if (planning.plannedChunkCount <= chunkIndex) {
    return undefined;
  }

  const currentJobId =
    progress.currentJobId ??
    getLinkedinImportHistoryJobId({ runId, chunkIndex });
  const currentJob = await getJobStatus(currentJobId);

  if (currentJob?.state === 'FAILED') {
    return { code: 'UNKNOWN', message: currentJob.failedReason ?? '' };
  }

  const hasEndedWithoutFinishing =
    currentJob?.state === 'COMPLETED' ||
    (!isDefined(currentJob) && isDefined(progress.currentJobId));

  if (!isDefined(currentJob) && !isDefined(progress.currentJobId)) {
    await enqueueLinkedinImportHistoryJob({
      connectedAccountId,
      runId,
      chunkIndex,
    });

    return undefined;
  }

  if (!hasEndedWithoutFinishing) {
    return undefined;
  }

  const recoveryCount = (progress.recoveryCount ?? 0) + 1;

  if (recoveryCount > LINKEDIN_HISTORY_IMPORT_MAX_RECOVERIES) {
    return STALLED_ERROR;
  }

  const resumePayload = {
    connectedAccountId,
    runId,
    chunkIndex,
    resumeIndex: (progress.currentResumeIndex ?? 0) + 1,
  };

  await saveLinkedinHistoryImportProgress({
    connectedAccountId,
    runId,
    progress: {
      ...progress,
      currentJobId: getLinkedinImportHistoryJobId(resumePayload),
      currentResumeIndex: resumePayload.resumeIndex,
      recoveryCount,
    },
  });
  await enqueueLinkedinImportHistoryJob(resumePayload);

  return undefined;
};

export const refreshLinkedinHistoryImportState = async (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const run = { connectedAccountId, runId: state.runId };
  const [planning, progress] = await Promise.all([
    getLinkedinHistoryImportPlanning(run),
    getLinkedinHistoryImportProgress(run),
  ]);
  const resumeAt = progress.resumeAt ?? planning.resumeAt;
  const currentState: LinkedinHistoryImportState = {
    ...state,
    importedConversationCount:
      progress.importedConversationCount +
      (progress.currentChunkImportedCount ?? 0),
    processedConversationCount:
      progress.completedConversationCount + progress.currentChunkProcessedCount,
    plannedChunkCount: planning.plannedChunkCount,
    plannedConversationCount: planning.plannedConversationCount,
    totalConversationCount: planning.reportedConversationCount,
    chunkCount: planning.chunkCount,
    resumeAt:
      isDefined(resumeAt) && Date.parse(resumeAt) > Date.now()
        ? resumeAt
        : undefined,
  };

  if (
    isDefined(planning.chunkCount) &&
    progress.completedChunkCount >= planning.chunkCount
  ) {
    return finishLinkedinHistoryImport({
      connectedAccountId,
      state: {
        ...currentState,
        status: 'COMPLETED',
        finishedAt: new Date().toISOString(),
      },
    });
  }

  const error =
    (await getPlanningError(planning, state.runId)) ??
    (await getCurrentChunkError({
      ...run,
      planning,
      progress,
    }));

  if (!isDefined(error)) {
    return currentState;
  }

  const latestState = await getLinkedinHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.status !== 'IMPORTING'
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
