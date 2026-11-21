import { isDefined } from 'twenty-sdk/utils';

import { isBackfillCompleted } from 'src/logic-functions/data/backfill-state.util';
import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { getWebhookSubscriptionState } from 'src/logic-functions/data/get-webhook-subscription-state.util';
import { type SubscribedApp } from 'src/logic-functions/types/subscribed-app.type';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { findPageIdsOfConnection } from 'src/logic-functions/data/link-pages-to-connection.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';
import { type PageHealth } from 'src/logic-functions/types/page-health.type';

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const getConnectionPagesHealth = async (
  connectedAccountId: string,
): Promise<PageHealth[]> => {
  const linkedPageIds = await findPageIdsOfConnection(connectedAccountId);
  const pages = await listMessengerPages(
    await getMessengerAccessTokenOrThrow(connectedAccountId),
  );

  return Promise.all(
    linkedPageIds.map(async (pageId): Promise<PageHealth> => {
      const page = pages.find(({ id }) => id === pageId);
      const isHistoryImported = await isBackfillCompleted(pageId);
      const unhealthy = {
        id: pageId,
        name: page?.name ?? pageId,
        isSubscribed: false,
        missingWebhookFields: [],
        isHistoryImported,
      };

      if (!isDefined(page)) {
        return {
          ...unhealthy,
          error:
            'The system user no longer has this Page. Assign it again and reconnect.',
        };
      }

      try {
        // a Page token belongs to this app, so /app names the app to look for among the subscriptions
        const [{ id: appId }, { data: subscribedApps }] = await Promise.all([
          graphApiRequest<{ id: string }>({
            accessToken: page.access_token,
            method: 'GET',
            path: 'app',
          }),
          graphApiRequest<{ data: SubscribedApp[] }>({
            accessToken: page.access_token,
            method: 'GET',
            path: `${page.id}/subscribed_apps`,
          }),
        ]);

        return {
          ...unhealthy,
          ...getWebhookSubscriptionState({ subscribedApps, appId }),
          error: null,
        };
      } catch (error) {
        return { ...unhealthy, error: toErrorMessage(error) };
      }
    }),
  );
};
