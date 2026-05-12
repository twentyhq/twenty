import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const mockedApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: REACT_APP_SERVER_BASE_URL + '/metadata',
  }),
  cache: new InMemoryCache(),
});
