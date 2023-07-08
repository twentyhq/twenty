import { useMemo, useRef } from 'react';
import {
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { useRecoilState } from 'recoil';

import { isMockModeState } from '@/auth/states/isMockModeState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { CommentThreadTarget } from '~/generated/graphql';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedUsersData } from '~/testing/mock-data/users';

import { ApolloFactory } from '../services/apollo.factory';

export function useApolloFactory() {
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const [tokenPair, setTokenPair] = useRecoilState(tokenPairState);
  const [isMockMode] = useRecoilState(isMockModeState);

  const apolloClient = useMemo(() => {
    const mockLink = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        if (operation.operationName === 'GetCompanies') {
          return { data: { companies: mockedCompaniesData } };
        }
        if (operation.operationName === 'GetCurrentUser') {
          return { data: { currentUser: mockedUsersData[0] } };
        }

        return response;
      });
    });

    apolloRef.current = new ApolloFactory({
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
      onTokenPairChange(tokenPair) {
        setTokenPair(tokenPair);
      },
      onUnauthenticatedError() {
        setTokenPair(null);
      },
      extraLinks: isMockMode ? [mockLink] : [],
      isDebugMode,
      tokenPair,
    });

    return apolloRef.current.getClient();
  }, [isMockMode, setTokenPair, isDebugMode, tokenPair]);

  return apolloClient;
}
