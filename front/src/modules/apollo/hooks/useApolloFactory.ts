import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { AppPath } from '@/types/AppPath';
import { ActivityTarget } from '~/generated/graphql';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

import { ApolloFactory } from '../services/apollo.factory';

export function useApolloFactory() {
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const navigate = useNavigate();
  const [tokenPair, setTokenPair] = useRecoilState(tokenPairState);

  const apolloClient = useMemo(() => {
    apolloRef.current = new ApolloFactory({
      uri: `${process.env.REACT_APP_API_URL}`,
      cache: new InMemoryCache({
        typePolicies: {
          Activity: {
            fields: {
              activityTargets: {
                merge(
                  existing: ActivityTarget[] = [],
                  incoming: ActivityTarget[],
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
      // We don't want to re-create the client on token change or it will cause infinite loop
      initialTokenPair: tokenPair,
      onTokenPairChange(tokenPair) {
        setTokenPair(tokenPair);
      },
      onUnauthenticatedError() {
        setTokenPair(null);
        navigate(AppPath.SignIn);
      },
      extraLinks: [],
      isDebugMode,
    });

    return apolloRef.current.getClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTokenPair, isDebugMode]);

  useUpdateEffect(() => {
    if (apolloRef.current) {
      apolloRef.current.updateTokenPair(tokenPair);
    }
  }, [tokenPair]);

  return apolloClient;
}
