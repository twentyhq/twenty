import { ApolloClient, InMemoryCache } from '@apollo/client';

const getApolloClient = async () => {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  const { serverBaseUrl } = await chrome.storage.local.get('serverBaseUrl');
  const cache = new InMemoryCache();
  const serverUrl = `${
    serverBaseUrl ? serverBaseUrl : import.meta.env.VITE_SERVER_BASE_URL
  }/graphql`;

  if (apiKey) {
    return new ApolloClient({
      cache,
      uri: serverUrl,
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
