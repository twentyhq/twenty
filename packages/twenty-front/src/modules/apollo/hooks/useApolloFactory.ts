import { InMemoryCache, type NormalizedCacheObject } from '@apollo/client';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ApolloFactory, type Options } from '@/apollo/services/apollo.factory';

export const useApolloFactory = (options: Partial<Options<any>> = {}) => {
  // eslint-disable-next-line @nx/workspace-no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);

  const navigate = useNavigate();
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const appVersion = useRecoilValue(appVersionState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);

  const setPreviousUrl = useSetRecoilState(previousUrlState);
  const location = useLocation();

  const { enqueueErrorSnackBar } = useSnackBar();

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

      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
      connectToDevTools: process.env.IS_DEBUG_MODE === 'true',
      currentWorkspaceMember: currentWorkspaceMember,
      currentWorkspace: currentWorkspace,
      appVersion,
      onTokenPairChange: (tokenPair) => {
        setTokenPair(tokenPair);
      },
      onUnauthenticatedError: () => {
        // eslint-disable-next-line no-console
        console.log('onUnauthenticatedError, resetting state');
        setTokenPair(null);
        setCurrentUser(null);
        setCurrentWorkspaceMember(null);
        setCurrentWorkspace(null);
        setCurrentUserWorkspace(null);
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
      onAppVersionMismatch: (message) => {
        enqueueErrorSnackBar({
          message,
          options: {
            dedupeKey: 'app-version-mismatch',
          },
        });
      },
      extraLinks: [],
      isDebugMode: process.env.IS_DEBUG_MODE === 'true',
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
    setPreviousUrl,
    enqueueErrorSnackBar,
  ]);

  useUpdateEffect(() => {
    if (isDefined(apolloRef.current)) {
      apolloRef.current.updateWorkspaceMember(currentWorkspaceMember);
    }
  }, [currentWorkspaceMember]);

  useUpdateEffect(() => {
    if (isDefined(apolloRef.current)) {
      apolloRef.current.updateCurrentWorkspace(currentWorkspace);
    }
  }, [currentWorkspace]);

  useUpdateEffect(() => {
    if (isDefined(apolloRef.current)) {
      apolloRef.current.updateAppVersion(appVersion);
    }
  }, [appVersion]);

  return apolloClient;
};
