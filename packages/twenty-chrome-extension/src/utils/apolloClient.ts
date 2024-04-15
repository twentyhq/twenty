import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

import { isDefined } from '~/utils/isDefined';

const clearStore = () => {
  chrome.storage.local.remove('loginToken');

  chrome.storage.local.remove('accessToken');

  chrome.storage.local.remove('refreshToken');

  chrome.storage.local.set({ isAuthenticated: false });
};

const getApolloClient = async () => {
  const store = await chrome.storage.local.get();
  const serverUrl = `${
    isDefined(store.serverBaseUrl)
      ? store.serverBaseUrl
      : import.meta.env.VITE_SERVER_BASE_URL
  }/graphql`;

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (isDefined(graphQLErrors)) {
      for (const graphQLError of graphQLErrors) {
        if (graphQLError.message === 'Unauthorized') {
          //TODO: replace this with renewToken mutation
          clearStore();
          return;
        }
        switch (graphQLError?.extensions?.code) {
          case 'UNAUTHENTICATED': {
            //TODO: replace this with renewToken mutation
            clearStore();
            break;
          }
          default:
            // eslint-disable-next-line no-console
            console.error(
              `[GraphQL error]: Message: ${graphQLError.message}, Location: ${
                graphQLError.locations
                  ? JSON.stringify(graphQLError.locations)
                  : graphQLError.locations
              }, Path: ${graphQLError.path}`,
            );
            break;
        }
      }
    }

    if (isDefined(networkError)) {
      // eslint-disable-next-line no-console
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const httpLink = new HttpLink({
    uri: serverUrl,
    headers: isDefined(store.accessToken)
      ? {
          Authorization: `Bearer ${store.accessToken.token}`,
        }
      : {},
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([errorLink, httpLink]),
  });

  return client;
};

export default getApolloClient;
