import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  getConnection,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/linkedin-history-import-chats-per-job.constant';
import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import { LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinPlanHistoryImportJobPayload } from 'src/logic-functions/types/linkedin-plan-history-import-job-payload.type';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { failLinkedinHistoryImportJob } from 'src/logic-functions/utils/fail-linkedin-history-import-job.util';
import { getActiveLinkedinHistoryImportState } from 'src/logic-functions/utils/get-active-linkedin-history-import-state.util';
import { getLinkedinPlanHistoryImportJobId } from 'src/logic-functions/utils/get-linkedin-history-import-job-id.util';
import {
  getLinkedinHistoryImportProgress,
  saveLinkedinHistoryImportChunkChats,
} from 'src/logic-functions/utils/linkedin-history-import-kv.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';
import { sortUnipileChatsByLastMessage } from 'src/unipile/utils/sort-unipile-chats-by-last-message.util';

const LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT = 3;

const LINKEDIN_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS = 10 * 60 * 1000;

type LinkedinPlanHistoryImportResult = {
  status: 'CANCELLED' | 'CONTINUED' | 'PLANNED';
  chunkCount?: number;
};

const continuePlanning = async (
  payload: LinkedinPlanHistoryImportJobPayload,
  delayMs?: number,
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
    state: {
      ...state,
      planJobId,
      resumeAt: isDefined(delayMs)
        ? new Date(Date.now() + delayMs).toISOString()
        : undefined,
    },
  });
  await enqueueJobs({
    logicFunctionUniversalIdentifier:
      LINKEDIN_PLAN_HISTORY_IMPORT_UNIVERSAL_IDENTIFIER,
    jobs: [{ jobId: planJobId, payload }],
    retryLimit: LINKEDIN_PLAN_HISTORY_IMPORT_RETRY_LIMIT,
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
  payload: LinkedinPlanHistoryImportJobPayload;
  chunkIndex: number;
  chats: UnipileChat[];
  conversationCount: number;
  reportedConversationCount: number | undefined;
}): Promise<boolean> => {
  const { connectedAccountId, runId } = payload;
  const state = await getActiveLinkedinHistoryImportState(payload);

  if (state === null) {
    return false;
  }

  await saveLinkedinHistoryImportChunkChats({
    connectedAccountId,
    runId,
    chunkIndex,
    chats,
  });
  await saveLinkedinHistoryImportState({
    connectedAccountId,
    state: {
      ...state,
      resumeAt: undefined,
      plannedChunkCount: chunkIndex + 1,
      plannedConversationCount: conversationCount,
      ...(isDefined(reportedConversationCount)
        ? { totalConversationCount: reportedConversationCount }
        : {}),
    },
  });

  const { completedChunkCount } =
    await getLinkedinHistoryImportProgress(payload);

  if (completedChunkCount === chunkIndex) {
    await enqueueLinkedinImportHistoryJob({
      connectedAccountId,
      runId,
      chunkIndex,
    });
  }

  return true;
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

  console.log(
    `[linkedin] history run ${payload.runId}: listing done, ${conversationCount} conversations in ${chunkCount} pages`,
  );

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

  let inboxIndex = payload.inboxIndex ?? 0;
  let cursor = payload.cursor;
  let chunkCount = payload.plannedChunkCount ?? 0;
  let conversationCount = payload.plannedConversationCount ?? 0;
  let reportedConversationCount = payload.reportedConversationCount;

  const continueFromHere = (delayMs?: number) =>
    continuePlanning(
      {
        connectedAccountId,
        runId,
        continuationIndex: (payload.continuationIndex ?? 0) + 1,
        inboxIndex,
        cursor,
        plannedChunkCount: chunkCount,
        plannedConversationCount: conversationCount,
        reportedConversationCount,
      },
      delayMs,
    );

  const pauseOnRateLimit = async <TResult>(
    request: () => Promise<TResult>,
  ): Promise<TResult | LinkedinPlanHistoryImportResult> => {
    try {
      return await request();
    } catch (error) {
      if (!(error instanceof UnipileRateLimitError)) {
        throw error;
      }

      console.log(
        `[linkedin] history run ${runId}: listing paused for ${error.retryAfterSeconds}s: ${error.message}`,
      );

      return continueFromHere(error.retryAfterSeconds * 1000);
    }
  };

  const inboxIds = await pauseOnRateLimit(() =>
    listUnipileInboxIds(unipileAccountId),
  );

  if (!Array.isArray(inboxIds)) {
    return inboxIds;
  }

  while (inboxIndex < inboxIds.length) {
    if (
      Date.now() - startedAt >
      LINKEDIN_PLAN_HISTORY_IMPORT_TIME_BUDGET_MILLISECONDS
    ) {
      return continueFromHere();
    }

    const page = await pauseOnRateLimit(() =>
      listUnipileChats({
        accountId: unipileAccountId,
        inboxId: inboxIds[inboxIndex],
        cursor,
        limit: LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
      }),
    );

    if (!('items' in page)) {
      return page;
    }

    if (
      inboxIds.length === 1 &&
      !isDefined(cursor) &&
      isDefined(page.totalCount)
    ) {
      reportedConversationCount = page.totalCount;
    }

    const chats = sortUnipileChatsByLastMessage(page.items);

    console.log(
      `[linkedin] history run ${runId}: inbox ${inboxIndex + 1} of ${inboxIds.length}, ${chats.length} chats listed (last messages ${chats[0]?.last_message_timestamp ?? '-'} to ${chats[chats.length - 1]?.last_message_timestamp ?? '-'})${isDefined(page.totalCount) ? `, ${page.totalCount} in inbox` : ''}`,
    );

    if (chats.length > 0) {
      conversationCount += chats.length;

      if (
        !(await planChunk({
          payload,
          chunkIndex: chunkCount,
          chats,
          conversationCount,
          reportedConversationCount,
        }))
      ) {
        return { status: 'CANCELLED' };
      }

      chunkCount += 1;
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
    'Lists the past LinkedIn conversations of a connection, most recent first, stores them page by page for the import jobs and starts the import chain; hands over to a new planning job when its time runs out.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinPlanHistoryImportHandler,
});
