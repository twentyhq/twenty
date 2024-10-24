import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { workspacesState } from '@/auth/states/workspaces';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';
import { isDefined } from '~/utils/isDefined';

import { AppPath } from '@/types/AppPath';
import { ApolloFactory, Options } from '../services/apollo.factory';

export const useApolloFactory = (options: Partial<Options<any>> = {}) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const navigate = useNavigate();
  const isMatchingLocation = useIsMatchingLocation();
  const [tokenPair, setTokenPair] = useRecoilState(tokenPairState);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  const setWorkspaces = useSetRecoilState(workspacesState);
  const [, setPreviousUrl] = useRecoilState(previousUrlState);
  const location = useLocation();

  const apolloClient = useMemo(() => {
    apolloRef.current = new ApolloFactory({
      uri: `${REACT_APP_SERVER_BASE_URL}/graphql`,
      cache: new InMemoryCache({
        typePolicies: {
          RemoteTable: {
            keyFields: ['name'],
          },
        },
      }),
      headers: {
        ...(currentWorkspace?.metadataVersion && {
          'X-Schema-Version': `${currentWorkspace.metadataVersion}`,
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
        setCurrentUser(null);
        setCurrentWorkspaceMember(null);
        setCurrentWorkspace(null);
        setWorkspaces(null);
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
    setCurrentUser,
    setCurrentWorkspaceMember,
    setCurrentWorkspace,
    setWorkspaces,
    isDebugMode,
    currentWorkspace?.metadataVersion,
    setPreviousUrl,
  ]);

  useUpdateEffect(() => {
    if (isDefined(apolloRef.current)) {
      apolloRef.current.updateTokenPair(tokenPair);
    }
  }, [tokenPair]);

  return apolloClient;
};
