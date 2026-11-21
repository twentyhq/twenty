import { defineLogicFunction } from 'twenty-sdk/define';

import { MESSENGER_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { forgetBackfillCompletion } from 'src/logic-functions/data/backfill-completion.util';
import { getMessengerAccessTokenOrThrow } from 'src/logic-functions/data/get-messenger-access-token-or-throw.util';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import {
  findPageIdsOfConnection,
  unlinkPagesFromConnection,
} from 'src/logic-functions/data/link-pages-to-connection.util';
import { listMessengerPages } from 'src/logic-functions/data/list-messenger-pages.util';

const unsubscribePages = async (connectedAccountId: string) => {
  const linkedPageIds = await findPageIdsOfConnection(connectedAccountId);
  const accessToken = await getMessengerAccessTokenOrThrow(connectedAccountId);
  const pages = (await listMessengerPages(accessToken)).filter(({ id }) =>
    linkedPageIds.includes(id),
  );

  for (const page of pages) {
    await graphApiRequest({
      accessToken: page.access_token,
      method: 'DELETE',
      path: `${page.id}/subscribed_apps`,
    });
  }
};

const handler = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  try {
    await unsubscribePages(connectedAccountId);
  } catch (error) {
    // a revoked token must not keep Twenty from forgetting the Pages
    console.warn(
      `Could not unsubscribe the Pages of Messenger connection ${connectedAccountId}`,
      error,
    );
  }

  // a later connection imports the history again, since disconnecting may remove the channels
  await Promise.all(
    (await findPageIdsOfConnection(connectedAccountId)).map(
      forgetBackfillCompletion,
    ),
  );

  await unlinkPagesFromConnection(connectedAccountId);
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-disconnect',
  description:
    'Unsubscribes the Facebook Pages of a disconnected account from Messenger webhooks',
  timeoutSeconds: 60,
  handler,
});
