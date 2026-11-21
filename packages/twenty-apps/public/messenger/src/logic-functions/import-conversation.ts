import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { ingestMessages } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { MESSENGER_CONVERSATIONS_API_CALL_INTERVAL_MS } from 'src/constants/messenger-backfill.constant';
import { MESSENGER_LOGIC_FUNCTION_IMPORT_CONVERSATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { markBackfillCompleted } from 'src/logic-functions/data/backfill-completion.util';
import { buildBackfillIngestMessages } from 'src/logic-functions/data/build-backfill-ingest-messages.util';
import { findConnectedAccountIdByPageId } from 'src/logic-functions/data/find-connected-account-id-by-page-id.util';
import { findConversationCustomer } from 'src/logic-functions/data/find-conversation-customer.util';
import { findOrCreateMessengerPersonId } from 'src/logic-functions/data/find-or-create-messenger-person-id.util';
import { findPageMessageChannelOrThrow } from 'src/logic-functions/data/find-page-message-channel-or-throw.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { splitFullName } from 'src/logic-functions/data/split-full-name.util';
import { wait } from 'src/logic-functions/data/wait.util';
import {
  type ConversationsApiMessage,
  type ConversationsApiMessageIds,
  type ImportConversationPayload,
} from 'src/logic-functions/types/conversations-api.type';

// Meta returns the details of only the 20 most recent messages of a conversation
const MESSENGER_BACKFILL_MESSAGES_PER_CONVERSATION = 20;

const importConversation = async ({
  pageId,
  conversationId,
}: Pick<ImportConversationPayload, 'pageId' | 'conversationId'>) => {
  const connectedAccountId = await findConnectedAccountIdByPageId(pageId);

  if (!isDefined(connectedAccountId)) {
    return;
  }

  const pageAccessToken = await getPageAccessTokenOrThrow({
    connectedAccountId,
    pageId,
  });
  const { messages: messageIds } =
    await graphApiRequest<ConversationsApiMessageIds>({
      accessToken: pageAccessToken,
      method: 'GET',
      path: conversationId,
      query: { fields: 'messages' },
    });

  const messages: ConversationsApiMessage[] = [];

  for (const { id } of (messageIds?.data ?? []).slice(
    0,
    MESSENGER_BACKFILL_MESSAGES_PER_CONVERSATION,
  )) {
    await wait(MESSENGER_CONVERSATIONS_API_CALL_INTERVAL_MS);
    messages.push(
      await graphApiRequest<ConversationsApiMessage>({
        accessToken: pageAccessToken,
        method: 'GET',
        path: id,
        query: { fields: 'id,created_time,from,to,message' },
      }),
    );
  }

  const customer = findConversationCustomer({ pageId, messages });

  if (!isDefined(customer)) {
    return;
  }

  const messageChannel = await findPageMessageChannelOrThrow({
    connectedAccountId,
    pageId,
  });
  const customerPersonId = await findOrCreateMessengerPersonId({
    client: new CoreApiClient(),
    pageId,
    pageScopedId: customer.id,
    resolveName: async () =>
      isNonEmptyString(customer.name) ? splitFullName(customer.name) : undefined,
  });

  // ingestion skips messages it already holds, so live messages are not imported twice
  await ingestMessages({
    messageChannelId: messageChannel.id,
    messages: buildBackfillIngestMessages({
      pageId: messageChannel.handle,
      customerId: customer.id,
      customerPersonId,
      messages,
    }),
  });
};

const handler = async (payload: ImportConversationPayload) => {
  await importConversation(payload);

  if (payload.isLastConversation) {
    await markBackfillCompleted(payload.pageId);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_IMPORT_CONVERSATION_UNIVERSAL_IDENTIFIER,
  name: 'import-conversation',
  description:
    'Imports the 20 most recent messages of one past Messenger conversation',
  timeoutSeconds: 60,
  handler,
});
