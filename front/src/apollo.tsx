import {
  ApolloClient,
  InMemoryCache,
  Observable,
  createHttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RestLink } from 'apollo-link-rest';
import { onError } from '@apollo/client/link/error';
import { refreshAccessToken } from './services/auth/AuthService';

const apiLink = createHttpLink({
  uri: `${process.env.REACT_APP_API_URL}`,
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

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      switch (err.extensions.code) {
        case 'invalid-jwt':
        case 'not-found':
          return new Observable((observer) => {
            (async () => {
              try {
                await refreshAccessToken();

                const oldHeaders = operation.getContext().headers;

                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${localStorage.getItem(
                      'accessToken',
                    )}`,
                  },
                });

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                forward(operation).subscribe(subscriber);
              } catch (error) {
                observer.error(error);
              }
            })();
          });
      }
    }
  }
});

export const apiClient = new ApolloClient({
  link: from([errorLink, withAuthHeadersLink, apiLink]),
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
