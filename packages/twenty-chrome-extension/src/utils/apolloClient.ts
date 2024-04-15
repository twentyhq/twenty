import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { isDefined } from '~/utils/isDefined';

const clearStore = () => {
  chrome.storage.local.set({
    loginToken: null,
  });

  chrome.storage.local.set({
    accessToken: null,
  });

  chrome.storage.local.set({
    refreshToken: null,
  });
}

const getApolloClient = async () => {
  const store = await chrome.storage.local.get();
  const serverUrl = `${
    isDefined(store.serverBaseUrl) ? store.serverBaseUrl : import.meta.env.VITE_SERVER_BASE_URL
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
            console.error(
              `[GraphQL error]: Message: ${
                graphQLError.message
              }, Location: ${
                graphQLError.locations
                  ? JSON.stringify(graphQLError.locations)
                  : graphQLError.locations
              }, Path: ${graphQLError.path}`,
            );
            break;
        }
      }
    }
    if (networkError) console.error(`[Network error]: ${networkError}`);
  });

  const httpLink = new HttpLink({ 
    uri: serverUrl, 
    headers: isDefined(store.accessToken) ? {
      Authorization: `Bearer ${store.accessToken.token}`
    } : {}
  })

  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: from([errorLink, httpLink]),
  });

  return client;
};

export default getApolloClient;
