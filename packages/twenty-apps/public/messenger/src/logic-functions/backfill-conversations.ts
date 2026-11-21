import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import {
  MESSENGER_BACKFILL_CONVERSATION_SPACING_MS,
  MESSENGER_BACKFILL_CONVERSATIONS_PER_PAGE,
} from 'src/constants/messenger-backfill.constant';
import {
  MESSENGER_LOGIC_FUNCTION_BACKFILL_CONVERSATIONS_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_IMPORT_CONVERSATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { markBackfillCompleted } from 'src/logic-functions/data/backfill-completion.util';
import { enqueueBackfillConversations } from 'src/logic-functions/data/enqueue-backfill-conversations.util';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import {
  type BackfillConversationsPayload,
  type ConversationsApiConversationList,
} from 'src/logic-functions/types/conversations-api.type';

// lists one page of conversations and spaces their imports to stay under the Page rate limit
const handler = async ({
  pageId,
  backfillRunId,
  after,
}: BackfillConversationsPayload) => {
  const connectedAccountId = await findConnectedAccountIdByPageId(pageId);

  if (!isDefined(connectedAccountId)) {
    return;
  }

  let conversations: ConversationsApiConversationList;

  try {
    conversations = await graphApiRequest<ConversationsApiConversationList>({
      accessToken: await getPageAccessTokenOrThrow({ connectedAccountId, pageId }),
      method: 'GET',
      path: `${pageId}/conversations`,
      query: {
        platform: 'messenger',
        fields: 'id,updated_time',
        limit: String(MESSENGER_BACKFILL_CONVERSATIONS_PER_PAGE),
        ...(isDefined(after) ? { after } : {}),
      },
    });
  } catch (error) {
    // without Advanced Access Meta refuses the Conversations API, and retrying cannot help
    if (error instanceof GraphApiError) {
      console.warn(`Messenger history import stopped for Page ${pageId}: ${error.message}`);

      return;
    }

    throw error;
  }

  const nextCursor = conversations.paging?.cursors?.after;
  const isLastPage =
    !isDefined(conversations.paging?.next) || !isDefined(nextCursor);

  for (const [index, { id: conversationId }] of conversations.data.entries()) {
    await enqueueLogicFunctionJobs({
      logicFunctionUniversalIdentifier:
        MESSENGER_LOGIC_FUNCTION_IMPORT_CONVERSATION_UNIVERSAL_IDENTIFIER,
      payloads: [
        {
          pageId,
          backfillRunId,
          conversationId,
          isLastConversation:
            isLastPage && index === conversations.data.length - 1,
        },
      ],
      getJobKey: () => `${backfillRunId}:${conversationId}`,
      delayMs: index * MESSENGER_BACKFILL_CONVERSATION_SPACING_MS,
    });
  }

  if (isLastPage) {
    if (conversations.data.length === 0) {
      await markBackfillCompleted(pageId);
    }

    return;
  }

  await enqueueBackfillConversations({
    payload: { pageId, backfillRunId, after: nextCursor },
    delayMs:
      conversations.data.length * MESSENGER_BACKFILL_CONVERSATION_SPACING_MS,
  });
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_BACKFILL_CONVERSATIONS_UNIVERSAL_IDENTIFIER,
  name: 'backfill-conversations',
  description:
    'Lists the past Messenger conversations of a Page and queues the import of each',
  timeoutSeconds: 60,
  handler,
});
