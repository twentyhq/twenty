import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { isDefined } from '~/utils/isDefined';

export const clearStore = () => {
  chrome.storage.local.remove([
    'loginToken',
    'accessToken',
    'refreshToken',
    'sidepanelUrl',
  ]);
  chrome.storage.local.set({ isAuthenticated: false });
};

export const getServerUrl = async () => {
  const store = await chrome.storage.local.get();
  const serverUrl = `${
    isDefined(store.serverBaseUrl)
      ? store.serverBaseUrl
      : import.meta.env.VITE_SERVER_BASE_URL
  }/graphql`;
  return serverUrl;
};

const getAuthToken = async () => {
  const store = await chrome.storage.local.get();
  if (isDefined(store.accessToken)) return `Bearer ${store.accessToken.token}`;
  else return '';
};

const getApolloClient = async () => {
  const authLink = setContext(async (_, { headers }) => {
    const token = await getAuthToken();
    return {
      headers: {
        ...headers,
        authorization: token,
      },
    };
  });
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (isDefined(graphQLErrors)) {
      for (const graphQLError of graphQLErrors) {
        if (graphQLError.message === 'Unauthorized') {
          clearStore();
          return;
        }
        switch (graphQLError?.extensions?.code) {
          case 'UNAUTHENTICATED': {
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
    uri: await getServerUrl(),
  });

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([errorLink, authLink, httpLink]),
  });

  return client;
};

export default getApolloClient;
