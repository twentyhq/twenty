import { ApolloClient, InMemoryCache } from '@apollo/client';

export const mockedApolloCoreClient = new ApolloClient({
  uri: process.env.REACT_APP_SERVER_BASE_URL + '/graphql',
  cache: new InMemoryCache(),
});
