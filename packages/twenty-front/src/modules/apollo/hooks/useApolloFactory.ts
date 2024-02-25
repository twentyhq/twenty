import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { tokenPairState } from '@/auth/states/tokenPairState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { AppPath } from '@/types/AppPath';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';

import { ApolloFactory } from '../services/apollo.factory';

export const useApolloFactory = () => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();
  const [tokenPair, setTokenPair] = useRecoilState(tokenPairState);

  const apolloClient = useMemo(() => {
    apolloRef.current = new ApolloFactory({
      uri: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'cache-first',
        },
      },
      connectToDevTools: isDebugMode,
      // We don't want to re-create the client on token change or it will cause infinite loop
      initialTokenPair: tokenPair,
      onTokenPairChange: (tokenPair) => {
        setTokenPair(tokenPair);
      },
      onUnauthenticatedError: () => {
        setTokenPair(null);
        if (
          !isMatchingLocation(AppPath.Verify) &&
          !isMatchingLocation(AppPath.SignIn) &&
          !isMatchingLocation(AppPath.SignUp) &&
          !isMatchingLocation(AppPath.Invite) &&
          !isMatchingLocation(AppPath.ResetPassword)
        ) {
          navigate(AppPath.SignIn);
        }
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
};
