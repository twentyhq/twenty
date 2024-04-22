import { useMemo, useRef } from 'react';
import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { AppPath } from '@/types/AppPath';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';
import {
  useIsMatchingLocation,
  useLocation,
  useNavigate,
} from '~/hooks/withoutRouter';
import { isDefined } from '~/utils/isDefined';

import { ApolloFactory, Options } from '../services/apollo.factory';

export const useApolloFactory = (options: Partial<Options<any>> = {}) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();
  const [tokenPair, setTokenPair] = useRecoilState(tokenPairState);
  const [, setPreviousUrl] = useRecoilState(previousUrlState);
  const location = useLocation();

  const apolloClient = useMemo(() => {
    apolloRef.current = new ApolloFactory({
      uri: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      cache: new InMemoryCache(),
      headers: {
        ...(currentWorkspace?.currentCacheVersion && {
          'X-Schema-Version': currentWorkspace.currentCacheVersion,
        }),
      },
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
          !isMatchingLocation(AppPath.SignInUp) &&
          !isMatchingLocation(AppPath.Invite) &&
          !isMatchingLocation(AppPath.ResetPassword)
        ) {
          setPreviousUrl(`${location.pathname}${location.search}`);
          navigate(AppPath.SignInUp);
        }
      },
      extraLinks: [],
      isDebugMode,
      // Override options
      ...options,
    });

    return apolloRef.current.getClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setTokenPair,
    isDebugMode,
    currentWorkspace?.currentCacheVersion,
    setPreviousUrl,
  ]);

  useUpdateEffect(() => {
    if (isDefined(apolloRef.current)) {
      apolloRef.current.updateTokenPair(tokenPair);
    }
  }, [tokenPair]);

  return apolloClient;
};
