import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  from,
  InMemoryCache,
} from '@apollo/client';

import { CommentThreadTarget } from '~/generated/graphql';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedUsersData } from '~/testing/mock-data/users';

import { ApolloFactory } from './apollo.factory';

const apollo = new ApolloFactory({
  uri: `${process.env.REACT_APP_API_URL}`,
  cache: new InMemoryCache({
    typePolicies: {
      CommentThread: {
        fields: {
          commentThreadTargets: {
            merge(
              existing: CommentThreadTarget[] = [],
              incoming: CommentThreadTarget[],
            ) {
              return [...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});

export const apolloClient = apollo.getClient();

const apiLink = createHttpLink({
  uri: `${process.env.REACT_APP_API_URL}`,
});

const mockLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    if (operation.operationName === 'GetCompanies') {
      return { data: { companies: mockedCompaniesData } };
    }
    if (operation.operationName === 'GetCurrentUser') {
      return { data: { users: [mockedUsersData[0]] } };
    }
    return response;
  });
});

export const mockClient = new ApolloClient({
  link: from([mockLink, apiLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'cache-first',
    },
  },
});
