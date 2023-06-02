import { ApolloClient, InMemoryCache } from '@apollo/client';

export const mockedClient = new ApolloClient({
  uri: process.env.REACT_APP_API_URL,
  cache: new InMemoryCache(),
});
