import {
  ApolloClient,
  from,
  fromPromise,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { renewToken } from '~/db/token.db';
import { Tokens } from '~/db/types/auth.types';
import { isDefined } from '~/utils/isDefined';

const clearStore = () => {
  chrome.storage.local.remove(['loginToken', 'accessToken', 'refreshToken']);
  chrome.storage.local.set({ isAuthenticated: false });
};

const setStore = (tokens: Tokens) => {
  if (isDefined(tokens.loginToken)) {
    chrome.storage.local.set({
      loginToken: tokens.loginToken,
    });
  }
  chrome.storage.local.set({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
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
  const store = await chrome.storage.local.get();

  const authLink = setContext(async (_, { headers }) => {
    const token = await getAuthToken();
    return {
      headers: {
        ...headers,
        authorization: token,
      },
    };
  });
  const errorLink = onError(
    ({ graphQLErrors, networkError, forward, operation }) => {
      if (isDefined(graphQLErrors)) {
        for (const graphQLError of graphQLErrors) {
          if (graphQLError.message === 'Unauthorized') {
            return fromPromise(
              renewToken(store.refreshToken.token)
                .then((response) => {
                  if (isDefined(response)) {
                    setStore(response.renewToken.tokens);
                  }
                })
                .catch(() => {
                  clearStore();
                }),
            ).flatMap(() => forward(operation));
          }
          switch (graphQLError?.extensions?.code) {
            case 'UNAUTHENTICATED': {
              return fromPromise(
                renewToken(store.refreshToken.token)
                  .then((response) => {
                    if (isDefined(response)) {
                      setStore(response.renewToken.tokens);
                    }
                  })
                  .catch(() => {
                    clearStore();
                  }),
              ).flatMap(() => forward(operation));
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
    },
  );

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
