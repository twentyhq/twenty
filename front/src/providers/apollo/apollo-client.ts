import { InMemoryCache } from '@apollo/client';

import { tokenService } from '@/auth/services/TokenService';
import { CommentThreadTarget } from '~/generated/graphql';

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
  onUnauthenticatedError() {
    tokenService.removeTokenPair();
  },
});

export const apolloClient = apollo.getClient();
