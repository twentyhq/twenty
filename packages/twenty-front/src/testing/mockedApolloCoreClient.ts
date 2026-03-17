import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const mockedApolloCoreClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_SERVER_BASE_URL + '/graphql',
  }),
  cache: new InMemoryCache(),
});
