import { getJobs, type JobStatusResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type LinkedinHistoryImportChatProgress } from 'src/logic-functions/types/linkedin-history-import-chat-progress.type';
import { type LinkedinHistoryImportPlanning } from 'src/logic-functions/types/linkedin-history-import-planning.type';
import {
  getLinkedinHistoryImportChatJobId,
  getLinkedinPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import {
  deleteLinkedinHistoryImportData,
  getLinkedinHistoryImportChatProgress,
  getLinkedinHistoryImportPlanning,
  saveLinkedinHistoryImportChatProgress,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { scheduleLinkedinHistoryImportChatJob } from 'src/logic-functions/utils/schedule-linkedin-history-import-chat-job.util';
import { scheduleNextLinkedinHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-linkedin-history-import-contacts.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const LINKEDIN_HISTORY_IMPORT_MAX_RECOVERIES = 3;

const STALLED_ERROR = {
  code: 'STALLED' as const,
  message: 'The import stopped making progress.',
};

type LinkedinHistoryImportRun = { connectedAccountId: string; runId: string };

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

const getFutureDate = (date: string | undefined): string | undefined =>
  isDefined(date) && Date.parse(date) > Date.now() ? date : undefined;

const getPlanningError = async (
  planning: LinkedinHistoryImportPlanning,
  runId: string,
): Promise<LinkedinHistoryImportState['error']> => {
  if (isDefined(planning.error)) {
    return planning.error;
  }

  const planJobId =
    planning.planJobId ?? getLinkedinPlanHistoryImportJobId({ runId });
  const [planJob] = await getJobs([planJobId]);

  // A finished planner always lists its conversations, unless it is one from before this format
  if (!isDefined(planJob) || planJob.state === 'COMPLETED') {
    return STALLED_ERROR;
  }

  return planJob.state === 'FAILED'
    ? { code: 'UNKNOWN', message: planJob.failedReason ?? '' }
    : undefined;
};

const failChat = async ({
  run,
  chatId,
  error,
}: {
  run: LinkedinHistoryImportRun;
  chatId: string;
  error: NonNullable<LinkedinHistoryImportChatProgress['error']>;
}): Promise<LinkedinHistoryImportChatProgress> => {
  const progress: LinkedinHistoryImportChatProgress = {
    status: 'FAILED',
    error,
  };

  await saveLinkedinHistoryImportChatProgress({ ...run, chatId, progress });

  return progress;
};

const checkImportingChat = async ({
  run,
  chatId,
  progress,
  jobStatusById,
}: {
  run: LinkedinHistoryImportRun;
  chatId: string;
  progress: LinkedinHistoryImportChatProgress;
  jobStatusById: Map<string, JobStatusResult>;
}): Promise<LinkedinHistoryImportChatProgress> => {
  if (!isDefined(progress.job)) {
    return failChat({ run, chatId, error: STALLED_ERROR });
  }

  const job = jobStatusById.get(
    getLinkedinHistoryImportChatJobId(progress.job),
  );

  if (job?.state === 'FAILED') {
    return failChat({
      run,
      chatId,
      error: { code: 'UNKNOWN', message: job.failedReason ?? '' },
    });
  }

  if (isDefined(job) && job.state !== 'COMPLETED') {
    return progress;
  }

  const recoveryCount = (progress.recoveryCount ?? 0) + 1;

  if (recoveryCount > LINKEDIN_HISTORY_IMPORT_MAX_RECOVERIES) {
    return failChat({ run, chatId, error: STALLED_ERROR });
  }

  const attempt = (progress.job.payload.attempt ?? 0) + 1;

  await scheduleLinkedinHistoryImportChatJob({
    job:
      progress.job.kind === 'CONTACTS'
        ? { kind: 'CONTACTS', payload: { ...progress.job.payload, attempt } }
        : { kind: 'MESSAGES', payload: { ...progress.job.payload, attempt } },
    recoveryCount,
  });

  return progress;
};

const getChatProgresses = async ({
  run,
  chatIds,
}: {
  run: LinkedinHistoryImportRun;
  chatIds: string[];
}): Promise<LinkedinHistoryImportChatProgress[]> => {
  const progresses = await Promise.all(
    chatIds.map((chatId) =>
      getLinkedinHistoryImportChatProgress({ ...run, chatId }),
    ),
  );
  const importingJobIds = progresses.flatMap((progress) =>
    progress?.status === 'IMPORTING' && isDefined(progress.job)
      ? [getLinkedinHistoryImportChatJobId(progress.job)]
      : [],
  );
  const jobStatusById = new Map(
    (importingJobIds.length > 0 ? await getJobs(importingJobIds) : []).map(
      (job) => [job.jobId, job],
    ),
  );

  return Promise.all(
    progresses.map((progress, index) => {
      const chatId = chatIds[index];

      if (!isDefined(progress)) {
        return failChat({ run, chatId, error: STALLED_ERROR });
      }

      if (progress.status !== 'IMPORTING') {
        return progress;
      }

      return checkImportingChat({ run, chatId, progress, jobStatusById });
    }),
  );
};

const getEarliestResumeAt = (
  importingProgresses: LinkedinHistoryImportChatProgress[],
): string | undefined => {
  const resumeDates = importingProgresses.map((progress) =>
    getFutureDate(progress.resumeAt),
  );

  if (resumeDates.length === 0 || !resumeDates.every(isDefined)) {
    return undefined;
  }

  return resumeDates.sort()[0];
};

const finishIfStillImporting = async ({
  connectedAccountId,
  state,
}: {
  connectedAccountId: string;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinHistoryImportState | null> => {
  const latestState = await getLinkedinHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.status !== 'IMPORTING'
  ) {
    return latestState;
  }

  return finishLinkedinHistoryImport({ connectedAccountId, state });
};

export const refreshLinkedinHistoryImportState = async (
  connectedAccountId: string,
): Promise<LinkedinHistoryImportState | null> => {
  const state = await getLinkedinHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const run = { connectedAccountId, runId: state.runId };
  const planning = await getLinkedinHistoryImportPlanning(run);

  if (!isDefined(planning.chatIds)) {
    const error = await getPlanningError(planning, state.runId);
    const listingState = {
      ...state,
      resumeAt: getFutureDate(planning.resumeAt),
    };

    return isDefined(error)
      ? finishIfStillImporting({
          connectedAccountId,
          state: {
            ...listingState,
            status: 'FAILED',
            finishedAt: new Date().toISOString(),
            error,
          },
        })
      : listingState;
  }

  const progresses = await getChatProgresses({
    run,
    chatIds: planning.chatIds,
  });
  const importingProgresses = progresses.filter(
    (progress) => progress.status === 'IMPORTING',
  );
  const pendingCount = progresses.filter(
    (progress) => progress.status === 'PENDING',
  ).length;

  if (
    pendingCount > 0 &&
    !importingProgresses.some((progress) => progress.job?.kind === 'CONTACTS')
  ) {
    await scheduleNextLinkedinHistoryImportContacts(run);
  }

  const importedConversationCount = progresses.filter(
    (progress) => progress.status === 'IMPORTED',
  ).length;
  const currentState: LinkedinHistoryImportState = {
    ...state,
    importedConversationCount,
    processedConversationCount:
      progresses.length - importingProgresses.length - pendingCount,
    totalConversationCount: progresses.length,
    resumeAt: getEarliestResumeAt(importingProgresses),
  };

  if (importingProgresses.length > 0 || pendingCount > 0) {
    return currentState;
  }

  const chatError = progresses.find((progress) =>
    isDefined(progress.error),
  )?.error;

  return finishIfStillImporting({
    connectedAccountId,
    state:
      importedConversationCount === 0 && isDefined(chatError)
        ? {
            ...currentState,
            status: 'FAILED',
            finishedAt: new Date().toISOString(),
            error: chatError,
          }
        : {
            ...currentState,
            status: 'COMPLETED',
            finishedAt: new Date().toISOString(),
          },
  });
};
