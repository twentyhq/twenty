import { InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { workspacesState } from '@/auth/states/workspaces';
import { isDebugModeState } from '@/client-config/states/isDebugModeState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { AppPath } from '@/types/AppPath';
import { isDefined } from 'twenty-shared/utils';
import { ApolloFactory, Options } from '../services/apollo.factory';

export const useApolloFactory = (options: Partial<Options<any>> = {}) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);
  const [isDebugMode] = useRecoilState(isDebugModeState);

  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);

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
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
      connectToDevTools: isDebugMode,
      currentWorkspaceMember: currentWorkspaceMember,
      onTokenPairChange: (tokenPair) => {
        setTokenPair(tokenPair);
      },
      onUnauthenticatedError: () => {
        setTokenPair(null);
        setCurrentUser(null);
        setCurrentWorkspaceMember(null);
        setCurrentWorkspace(null);
        setCurrentUserWorkspace(null);
        setWorkspaces([]);
        if (
          !isMatchingLocation(location, AppPath.Verify) &&
          !isMatchingLocation(location, AppPath.SignInUp) &&
          !isMatchingLocation(location, AppPath.Invite) &&
          !isMatchingLocation(location, AppPath.ResetPassword)
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
      apolloRef.current.updateWorkspaceMember(currentWorkspaceMember);
    }
  }, [currentWorkspaceMember]);

  return apolloClient;
};
