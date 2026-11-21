import { type CoreApiClient } from 'twenty-client-sdk/core';

import { fetchUserProfileName } from 'src/logic-functions/data/fetch-user-profile-name.util';
import { findOrCreateMessengerPersonId } from 'src/logic-functions/data/find-or-create-messenger-person-id.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';

export const resolveCustomerPersonId = ({
  client,
  connectedAccountId,
  pageId,
  pageScopedId,
}: {
  client: CoreApiClient;
  connectedAccountId: string;
  pageId: string;
  pageScopedId: string;
}) =>
  findOrCreateMessengerPersonId({
    client,
    pageId,
    pageScopedId,
    resolveName: async () =>
      fetchUserProfileName({
        pageAccessToken: await getPageAccessTokenOrThrow({
          connectedAccountId,
          pageId,
        }),
        pageScopedId,
      }),
  });
