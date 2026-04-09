import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export const mockedApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_SERVER_BASE_URL + '/metadata',
  }),
  cache: new InMemoryCache(),
});
