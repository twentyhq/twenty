import { defineLogicFunction } from 'twenty-sdk/define';

import { MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { isBackfillCompleted } from 'src/logic-functions/data/backfill-completion.util';
import { enqueueBackfillConversations } from 'src/logic-functions/data/enqueue-backfill-conversations.util';
import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { linkPagesToConnection } from 'src/logic-functions/data/link-pages-to-connection.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';
import { sendInboxNotification } from 'src/logic-functions/data/send-inbox-notification.util';
import { subscribePages } from 'src/logic-functions/data/subscribe-pages.util';
import { syncPageMessageChannels } from 'src/logic-functions/data/sync-page-message-channels.util';

// reconnecting runs this again, which also resubscribes Pages Meta unsubscribed after failed deliveries
const handler = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  const accessToken = await getMessengerAccessTokenOrThrow(connectedAccountId);
  const pages = await listMessengerPages(accessToken);

  const subscriptionFailures = await subscribePages(pages);

  await linkPagesToConnection({
    connectedAccountId,
    pageIds: pages.map(({ id }) => id),
  });

  await syncPageMessageChannels({ connectedAccountId, pages });

  if (subscriptionFailures.length > 0) {
    await sendInboxNotification({
      threadKey: `subscription_failed:${connectedAccountId}`,
      idempotencyKey: `subscription_failed:${connectedAccountId}:${Date.now()}`,
      title: 'Some Messenger Pages are not receiving messages',
      text: [
        'Meta refused to subscribe these Pages to the webhook. Resubscribe them from the Messenger app settings.',
        ...subscriptionFailures.map(
          ({ page, reason }) => `${page.name}: ${reason}`,
        ),
      ].join('\n'),
    });
  }

  const backfillRunId = String(Date.now());

  for (const page of pages) {
    if (!(await isBackfillCompleted(page.id))) {
      await enqueueBackfillConversations({
        payload: { pageId: page.id, backfillRunId },
      });
    }
  }
};

export default defineLogicFunction({
  universalIdentifier: MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description:
    'Subscribes each Facebook Page of the token to Messenger webhooks, creates a message channel per Page and starts importing past conversations',
  timeoutSeconds: 120,
  handler,
});
