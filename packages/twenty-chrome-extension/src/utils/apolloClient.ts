import { ApolloClient, InMemoryCache } from '@apollo/client';

const getApolloClient = async () => {
  const { apiKey } = await chrome.storage.local.get('apiKey');
  const { serverBaseUrl } = await chrome.storage.local.get('serverBaseUrl');

  return new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${
      serverBaseUrl ? serverBaseUrl : import.meta.env.VITE_SERVER_BASE_URL
    }/graphql`,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
};

export default getApolloClient;
