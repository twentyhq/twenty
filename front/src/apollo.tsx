import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RestLink } from 'apollo-link-rest';

const apiLink = createHttpLink({
  uri: `${process.env.REACT_APP_API_URL}/v1/graphql`,
});

const withAuthHeadersLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apiClient = new ApolloClient({
  link: withAuthHeadersLink.concat(apiLink),
  cache: new InMemoryCache(),
});

const authLink = new RestLink({
  uri: `${process.env.REACT_APP_AUTH_URL}`,
  credentials: 'same-origin',
});

export const authClient = new ApolloClient({
  link: authLink,
  cache: new InMemoryCache(),
});
