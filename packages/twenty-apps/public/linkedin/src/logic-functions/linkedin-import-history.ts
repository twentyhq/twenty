import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS } from 'src/constants/linkedin-import-history-timeout-seconds.constant';
import { LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/linkedin-history-import-chats-per-job.constant';
import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { getLinkedinHistoryImportError } from 'src/logic-functions/utils/get-linkedin-history-import-error.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { countUnipileChats } from 'src/unipile/utils/count-unipile-chats.util';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';
import { listUnipileChatMessages } from 'src/unipile/utils/list-unipile-chat-messages.util';
import { listUnipileChats } from 'src/unipile/utils/list-unipile-chats.util';

type LinkedinImportHistoryResult = {
  status: 'SUPERSEDED' | 'CONTINUED' | 'COMPLETED';
  importedConversationCount?: number;
};

const importPage = async ({
  payload,
  state,
}: {
  payload: LinkedinImportHistoryJobPayload;
  state: LinkedinHistoryImportState;
}): Promise<LinkedinImportHistoryResult> => {
  const { connectedAccountId } = payload;
  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isNonEmptyString(unipileAccountId) || !isDefined(channel)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account or message channel`,
    );
  }

  const settings = await getLinkedinSettings(connectedAccountId);
  const inboxIds = await listUnipileInboxIds(unipileAccountId);
  const inboxId = payload.inboxId ?? inboxIds[0];

  if (!isDefined(inboxId)) {
    await saveLinkedinHistoryImportState({
      connectedAccountId,
      state: {
        ...state,
        totalConversationCount: 0,
        status: 'COMPLETED',
        finishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    return { status: 'COMPLETED', importedConversationCount: 0 };
  }

  const page = await listUnipileChats({
    accountId: unipileAccountId,
    inboxId,
    cursor: payload.cursor,
    limit: LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
  });

  const totalConversationCount =
    state.totalConversationCount ??
    (inboxIds.length === 1 ? page.totalCount : undefined) ??
    (await countUnipileChats({ accountId: unipileAccountId, inboxIds }));

  // Saved before the first chat is imported, so the button shows a percentage from the start
  if (state.totalConversationCount === undefined) {
    console.log(
      `[linkedin] history run ${payload.runId}: ${totalConversationCount} conversations to import`,
    );

    await saveLinkedinHistoryImportState({
      connectedAccountId,
      state: {
        ...state,
        totalConversationCount,
        updatedAt: new Date().toISOString(),
      },
    });
  }

  let importedConversationCount = 0;

  for (const listedChat of page.items) {
    // The list does not always embed attendees
    const chat: UnipileChat =
      getLinkedinChatCounterparts(listedChat).length > 0
        ? listedChat
        : await getUnipileChat({
            accountId: unipileAccountId,
            chatId: listedChat.id,
          });

    const ingestedMessageCount = await ingestLinkedinMessages({
      channel,
      settings,
      chat,
      counterparts: await Promise.all(
        getLinkedinChatCounterparts(chat).map((user) =>
          withLinkedinPublicIdentifier({ unipileAccountId, user }),
        ),
      ),
      messages: await listUnipileChatMessages({
        accountId: unipileAccountId,
        chatId: chat.id,
      }),
    });

    if (ingestedMessageCount > 0) {
      importedConversationCount += 1;
    }
  }

  // An empty page or a cursor equal to the one just used would loop forever
  const isLastPageOfInbox =
    page.items.length === 0 ||
    !isNonEmptyString(page.nextCursor) ||
    page.nextCursor === payload.cursor;
  const nextInboxId = isLastPageOfInbox
    ? inboxIds[inboxIds.indexOf(inboxId) + 1]
    : inboxId;
  const isLastPage = !isDefined(nextInboxId);

  console.log(
    `[linkedin] history run ${payload.runId} page ${payload.pageIndex}: ${page.items.length} chats, ${importedConversationCount} imported`,
  );
  const nextState: LinkedinHistoryImportState = {
    ...state,
    importedConversationCount:
      state.importedConversationCount + importedConversationCount,
    processedConversationCount:
      state.processedConversationCount + page.items.length,
    totalConversationCount,
    updatedAt: new Date().toISOString(),
    ...(isLastPage
      ? { status: 'COMPLETED', finishedAt: new Date().toISOString() }
      : {}),
  };

  await saveLinkedinHistoryImportState({
    connectedAccountId,
    state: nextState,
  });

  if (isLastPage) {
    return {
      status: 'COMPLETED',
      importedConversationCount: nextState.importedConversationCount,
    };
  }

  await enqueueLinkedinImportHistoryJob({
    connectedAccountId,
    runId: payload.runId,
    pageIndex: payload.pageIndex + 1,
    inboxId: nextInboxId,
    cursor: isLastPageOfInbox ? undefined : page.nextCursor,
  });

  return {
    status: 'CONTINUED',
    importedConversationCount: nextState.importedConversationCount,
  };
};

export const linkedinImportHistoryHandler = async (
  payload: LinkedinImportHistoryJobPayload,
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>,
): Promise<LinkedinImportHistoryResult> => {
  const state = await getLinkedinHistoryImportState(payload.connectedAccountId);

  if (state?.runId !== payload.runId || state.status !== 'IMPORTING') {
    return { status: 'SUPERSEDED' };
  }

  try {
    return await importPage({ payload, state });
  } catch (error) {
    const importError = getLinkedinHistoryImportError(error);

    // Twenty only retries a RetryableLogicFunctionError: any other error ends the job, so the run must be closed here
    if (
      importError.code === 'UNREACHABLE' &&
      isDefined(context) &&
      context.retryCount < context.maxRetries
    ) {
      throw new RetryableLogicFunctionError(importError.message);
    }

    console.error(
      `[linkedin] history run ${payload.runId} page ${payload.pageIndex} failed: ${importError.message}`,
    );

    await saveLinkedinHistoryImportState({
      connectedAccountId: payload.connectedAccountId,
      state: {
        ...state,
        status: 'FAILED',
        finishedAt: new Date().toISOString(),
        error: importError,
      },
    });

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-history',
  description:
    'Imports one page of past LinkedIn conversations of a connection, then queues the next page.',
  timeoutSeconds: LINKEDIN_IMPORT_HISTORY_TIMEOUT_SECONDS,
  handler: linkedinImportHistoryHandler,
});
