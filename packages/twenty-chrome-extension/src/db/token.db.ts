import { ApolloClient, InMemoryCache } from '@apollo/client';

import { Tokens } from '~/db/types/auth.types';
import { RENEW_TOKEN } from '~/graphql/auth/mutations';
import { isDefined } from '~/utils/isDefined';

export const renewToken = async (
  appToken: string,
): Promise<{ renewToken: { tokens: Tokens } } | null> => {
  const store = await chrome.storage.local.get();
  const serverUrl = `${
    isDefined(store.serverBaseUrl)
      ? store.serverBaseUrl
      : import.meta.env.VITE_SERVER_BASE_URL
  }/graphql`;

  // Create new client to call refresh token graphql mutation
  const client = new ApolloClient({
    uri: serverUrl,
    cache: new InMemoryCache({}),
  });

  const { data } = await client.mutate({
    mutation: RENEW_TOKEN,
    variables: {
      appToken,
    },
    fetchPolicy: 'network-only',
  });

  if (isDefined(data)) {
    return data;
  } else {
    return null;
  }
};
