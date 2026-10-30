import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  listMessageChannels,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB } from 'src/constants/linkedin-history-import-chats-per-job.constant';
import { LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinImportHistoryJobPayload } from 'src/logic-functions/types/linkedin-import-history-job-payload.type';
import { enqueueLinkedinImportHistoryJob } from 'src/logic-functions/utils/enqueue-linkedin-import-history-job.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinHistoryImportState } from 'src/logic-functions/utils/get-linkedin-history-import-state.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { saveLinkedinHistoryImportState } from 'src/logic-functions/utils/save-linkedin-history-import-state.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';
import { type UnipileChat } from 'src/unipile/types/unipile-chat.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
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
  const page = await listUnipileChats({
    accountId: unipileAccountId,
    cursor: payload.cursor,
    limit: LINKEDIN_HISTORY_IMPORT_CHATS_PER_JOB,
  });

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

  const isLastPage = !isNonEmptyString(page.nextCursor);
  const nextState: LinkedinHistoryImportState = {
    ...state,
    importedConversationCount:
      state.importedConversationCount + importedConversationCount,
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
    cursor: page.nextCursor,
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
    if (isDefined(context) && context.retryCount >= context.maxRetries) {
      await saveLinkedinHistoryImportState({
        connectedAccountId: payload.connectedAccountId,
        state: {
          ...state,
          status: 'FAILED',
          finishedAt: new Date().toISOString(),
        },
      });
    }

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_IMPORT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-import-history',
  description:
    'Imports one page of past LinkedIn conversations of a connection, then queues the next page.',
  timeoutSeconds: 900,
  handler: linkedinImportHistoryHandler,
});
