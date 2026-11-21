import { defineLogicFunction } from 'twenty-sdk/define';

import { MESSENGER_WEBHOOK_FIELDS } from 'src/constants/messenger-webhook-fields.constant';
import { MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { linkPagesToConnection } from 'src/logic-functions/data/link-pages-to-connection.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';
import { syncPageMessageChannels } from 'src/logic-functions/data/sync-page-message-channels.util';

// reconnecting runs this again, which also resubscribes Pages Meta unsubscribed after failed deliveries
const handler = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  const accessToken = await getMessengerAccessTokenOrThrow(connectedAccountId);
  const pages = await listMessengerPages(accessToken);

  for (const page of pages) {
    await graphApiRequest({
      accessToken: page.access_token,
      method: 'POST',
      path: `${page.id}/subscribed_apps`,
      query: { subscribed_fields: MESSENGER_WEBHOOK_FIELDS.join(',') },
    });
  }

  await linkPagesToConnection({
    connectedAccountId,
    pageIds: pages.map(({ id }) => id),
  });

  await syncPageMessageChannels({ connectedAccountId, pages });
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description:
    'Subscribes each Facebook Page of the token to Messenger webhooks and creates a message channel per Page',
  timeoutSeconds: 120,
  handler,
});
