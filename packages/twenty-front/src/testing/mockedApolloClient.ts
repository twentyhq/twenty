import { ApolloClient, InMemoryCache } from '@apollo/client';

export const mockedApolloClient = new ApolloClient({
  uri: process.env.REACT_APP_SERVER_BASE_URL + '/metadata',
  cache: new InMemoryCache(),
});
