import { InMemoryCache, type NormalizedCacheObject } from '@apollo/client';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApolloFactory, type Options } from '@/apollo/services/apollo.factory';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { previousUrlState } from '@/auth/states/previousUrlState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { appVersionState } from '@/client-config/states/appVersionState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useUpdateEffect } from '~/hooks/useUpdateEffect';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const useApolloFactory = (options: Partial<Options<any>> = {}) => {
  // eslint-disable-next-line twenty/no-state-useref
  const apolloRef = useRef<ApolloFactory<NormalizedCacheObject> | null>(null);

  const navigate = useNavigate();
  const setTokenPair = useSetAtomState(tokenPairState);
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const appVersion = useAtomStateValue(appVersionState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useAtomState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetAtomState(currentUserState);
  const setCurrentUserWorkspace = useSetAtomState(currentUserWorkspaceState);

  const setPreviousUrl = useSetAtomState(previousUrlState);
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
      onPayloadTooLarge: (message) => {
        enqueueErrorSnackBar({
          message,
          options: {
            dedupeKey: 'payload-too-large',
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
