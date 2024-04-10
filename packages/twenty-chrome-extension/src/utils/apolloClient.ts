import { ApolloClient, InMemoryCache } from '@apollo/client';

import { isDefined } from '~/utils/isDefined';

const getApolloClient = async () => {
  const store = await chrome.storage.local.get();
  const { serverBaseUrl } = await chrome.storage.local.get('serverBaseUrl');
  const cache = new InMemoryCache();
  const serverUrl = `${
    serverBaseUrl ? serverBaseUrl : import.meta.env.VITE_SERVER_BASE_URL
  }/graphql`;

  if (isDefined(store.accessToken)) {
    return new ApolloClient({
      cache,
      uri: serverUrl,
      headers: {
        Authorization: `Bearer ${store.accessToken.token}`,
      },
    });
  } else {
    return new ApolloClient({
      cache,
      uri: serverUrl,
    });
  }
};

export default getApolloClient;
