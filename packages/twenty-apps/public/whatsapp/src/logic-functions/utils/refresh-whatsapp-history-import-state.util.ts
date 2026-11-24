import { getJobs, type JobStatusResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappHistoryImportPlanning } from 'src/logic-functions/types/whatsapp-history-import-planning.type';
import { type WhatsappHistoryImportProgress } from 'src/logic-functions/types/whatsapp-history-import-progress.type';
import { enqueueWhatsappImportHistoryJob } from 'src/logic-functions/utils/enqueue-whatsapp-import-history-job.util';
import {
  getWhatsappImportHistoryJobId,
  getWhatsappPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { getWhatsappHistoryImportState } from 'src/logic-functions/utils/get-whatsapp-history-import-state.util';
import {
  deleteWhatsappHistoryImportData,
  getWhatsappHistoryImportPlanning,
  getWhatsappHistoryImportProgress,
  saveWhatsappHistoryImportProgress,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { saveWhatsappHistoryImportState } from 'src/logic-functions/utils/save-whatsapp-history-import-state.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const WHATSAPP_HISTORY_IMPORT_MAX_RECOVERIES = 3;

const STALLED_ERROR = {
  code: 'STALLED' as const,
  message: 'The import stopped making progress.',
};

export const finishWhatsappHistoryImport = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: WhatsappHistoryImportState;
}): Promise<WhatsappHistoryImportState> => {
  await saveWhatsappHistoryImportState({ connectedAccountId, state });
  await deleteWhatsappHistoryImportData({
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
  planning: WhatsappHistoryImportPlanning,
  runId: string,
): Promise<WhatsappHistoryImportState['error']> => {
  if (isDefined(planning.error)) {
    return planning.error;
  }

  if (isDefined(planning.chunkCount)) {
    return undefined;
  }

  const planJob = await getJobStatus(
    planning.planJobId ?? getWhatsappPlanHistoryImportJobId({ runId }),
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
  planning: WhatsappHistoryImportPlanning;
  progress: WhatsappHistoryImportProgress;
}): Promise<WhatsappHistoryImportState['error']> => {
  if (isDefined(progress.error)) {
    return progress.error;
  }

  const chunkIndex = progress.completedChunkCount;

  if (planning.plannedChunkCount <= chunkIndex) {
    return undefined;
  }

  const currentJobId =
    progress.currentJobId ??
    getWhatsappImportHistoryJobId({ runId, chunkIndex });
  const currentJob = await getJobStatus(currentJobId);

  if (currentJob?.state === 'FAILED') {
    return { code: 'UNKNOWN', message: currentJob.failedReason ?? '' };
  }

  const hasEndedWithoutFinishing =
    currentJob?.state === 'COMPLETED' ||
    (!isDefined(currentJob) && isDefined(progress.currentJobId));

  if (!isDefined(currentJob) && !isDefined(progress.currentJobId)) {
    await enqueueWhatsappImportHistoryJob({
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

  if (recoveryCount > WHATSAPP_HISTORY_IMPORT_MAX_RECOVERIES) {
    return STALLED_ERROR;
  }

  const resumePayload = {
    connectedAccountId,
    runId,
    chunkIndex,
    resumeIndex: (progress.currentResumeIndex ?? 0) + 1,
  };

  await saveWhatsappHistoryImportProgress({
    connectedAccountId,
    runId,
    progress: {
      ...progress,
      currentJobId: getWhatsappImportHistoryJobId(resumePayload),
      currentResumeIndex: resumePayload.resumeIndex,
      recoveryCount,
    },
  });
  await enqueueWhatsappImportHistoryJob(resumePayload);

  return undefined;
};

export const refreshWhatsappHistoryImportState = async (
  connectedAccountId: string,
): Promise<WhatsappHistoryImportState | null> => {
  const state = await getWhatsappHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const run = { connectedAccountId, runId: state.runId };
  const [planning, progress] = await Promise.all([
    getWhatsappHistoryImportPlanning(run),
    getWhatsappHistoryImportProgress(run),
  ]);
  const resumeAt = progress.resumeAt ?? planning.resumeAt;
  const currentState: WhatsappHistoryImportState = {
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
    return finishWhatsappHistoryImport({
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

  const latestState = await getWhatsappHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.status !== 'IMPORTING'
  ) {
    return latestState;
  }

  return finishWhatsappHistoryImport({
    connectedAccountId,
    state: {
      ...currentState,
      status: 'FAILED',
      finishedAt: new Date().toISOString(),
      error,
    },
  });
};
