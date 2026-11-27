import { getJobs, type JobStatusResult } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { type WhatsappHistoryImportChatProgress } from 'src/logic-functions/types/whatsapp-history-import-chat-progress.type';
import { type WhatsappHistoryImportPlanning } from 'src/logic-functions/types/whatsapp-history-import-planning.type';
import {
  getWhatsappHistoryImportChatJobId,
  getWhatsappPlanHistoryImportJobId,
} from 'src/logic-functions/utils/get-whatsapp-history-import-job-id.util';
import { getWhatsappHistoryImportState } from 'src/logic-functions/utils/get-whatsapp-history-import-state.util';
import {
  deleteWhatsappHistoryImportData,
  getWhatsappHistoryImportChatProgress,
  getWhatsappHistoryImportPlanning,
  saveWhatsappHistoryImportChatProgress,
} from 'src/logic-functions/utils/whatsapp-history-import-kv.util';
import { saveWhatsappHistoryImportState } from 'src/logic-functions/utils/save-whatsapp-history-import-state.util';
import { scheduleWhatsappHistoryImportChatJob } from 'src/logic-functions/utils/schedule-whatsapp-history-import-chat-job.util';
import { scheduleNextWhatsappHistoryImportContacts } from 'src/logic-functions/utils/schedule-next-whatsapp-history-import-contacts.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const WHATSAPP_HISTORY_IMPORT_MAX_RECOVERIES = 3;

const STALLED_ERROR = {
  code: 'STALLED' as const,
  message: 'The import stopped making progress.',
};

type WhatsappHistoryImportRun = { connectedAccountId: string; runId: string };

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

const getFutureDate = (date: string | undefined): string | undefined =>
  isDefined(date) && Date.parse(date) > Date.now() ? date : undefined;

const getPlanningError = async (
  planning: WhatsappHistoryImportPlanning,
  runId: string,
): Promise<WhatsappHistoryImportState['error']> => {
  if (isDefined(planning.error)) {
    return planning.error;
  }

  const planJobId =
    planning.planJobId ?? getWhatsappPlanHistoryImportJobId({ runId });
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
  run: WhatsappHistoryImportRun;
  chatId: string;
  error: NonNullable<WhatsappHistoryImportChatProgress['error']>;
}): Promise<WhatsappHistoryImportChatProgress> => {
  const progress: WhatsappHistoryImportChatProgress = {
    status: 'FAILED',
    error,
  };

  await saveWhatsappHistoryImportChatProgress({ ...run, chatId, progress });

  return progress;
};

const checkImportingChat = async ({
  run,
  chatId,
  progress,
  jobStatusById,
}: {
  run: WhatsappHistoryImportRun;
  chatId: string;
  progress: WhatsappHistoryImportChatProgress;
  jobStatusById: Map<string, JobStatusResult>;
}): Promise<WhatsappHistoryImportChatProgress> => {
  if (!isDefined(progress.job)) {
    return failChat({ run, chatId, error: STALLED_ERROR });
  }

  const job = jobStatusById.get(
    getWhatsappHistoryImportChatJobId(progress.job),
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

  if (recoveryCount > WHATSAPP_HISTORY_IMPORT_MAX_RECOVERIES) {
    return failChat({ run, chatId, error: STALLED_ERROR });
  }

  const attempt = (progress.job.payload.attempt ?? 0) + 1;

  await scheduleWhatsappHistoryImportChatJob({
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
  run: WhatsappHistoryImportRun;
  chatIds: string[];
}): Promise<WhatsappHistoryImportChatProgress[]> => {
  const progresses = await Promise.all(
    chatIds.map((chatId) =>
      getWhatsappHistoryImportChatProgress({ ...run, chatId }),
    ),
  );
  const importingJobIds = progresses.flatMap((progress) =>
    progress?.status === 'IMPORTING' && isDefined(progress.job)
      ? [getWhatsappHistoryImportChatJobId(progress.job)]
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
  importingProgresses: WhatsappHistoryImportChatProgress[],
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
  state: WhatsappHistoryImportState;
}): Promise<WhatsappHistoryImportState | null> => {
  const latestState = await getWhatsappHistoryImportState(connectedAccountId);

  if (
    latestState?.runId !== state.runId ||
    latestState.status !== 'IMPORTING'
  ) {
    return latestState;
  }

  return finishWhatsappHistoryImport({ connectedAccountId, state });
};

export const refreshWhatsappHistoryImportState = async (
  connectedAccountId: string,
): Promise<WhatsappHistoryImportState | null> => {
  const state = await getWhatsappHistoryImportState(connectedAccountId);

  if (!isDefined(state) || state.status !== 'IMPORTING') {
    return state;
  }

  const run = { connectedAccountId, runId: state.runId };
  const planning = await getWhatsappHistoryImportPlanning(run);

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
    await scheduleNextWhatsappHistoryImportContacts(run);
  }

  const importedConversationCount = progresses.filter(
    (progress) => progress.status === 'IMPORTED',
  ).length;
  const currentState: WhatsappHistoryImportState = {
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
