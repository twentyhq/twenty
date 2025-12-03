import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { authProvidersState } from '@/client-config/states/authProvidersState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { useInitializeFormatPreferences } from '@/localization/hooks/useInitializeFormatPreferences';
import { coreViewsState } from '@/views/states/coreViewState';
import { workspaceAuthBypassProvidersState } from '@/workspace/states/workspaceAuthBypassProvidersState';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SOURCE_LOCALE, type APP_LOCALES } from 'twenty-shared/translations';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ColorScheme } from 'twenty-ui/input';
import {
  useFindAllCoreViewsLazyQuery,
  useGetCurrentUserLazyQuery,
} from '~/generated-metadata/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const useLoadCurrentUser = () => {
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setAvailableWorkspaces = useSetRecoilState(availableWorkspacesState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const { setLastAuthenticateWorkspaceDomain } =
    useLastAuthenticatedWorkspaceDomain();
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const { initializeFormatPreferences } = useInitializeFormatPreferences();
  const setCoreViews = useSetRecoilState(coreViewsState);
  const setWorkspaceAuthBypassProviders = useSetRecoilState(
    workspaceAuthBypassProvidersState,
  );
  const authProviders = useRecoilValue(authProvidersState);

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const [getCurrentUser] = useGetCurrentUserLazyQuery();
  const [findAllCoreViews] = useFindAllCoreViewsLazyQuery();

  const loadCurrentUser = useCallback(async () => {
    const currentUserResult = await getCurrentUser({
      fetchPolicy: 'network-only',
    });

    const coreViewsResult = await findAllCoreViews({
      fetchPolicy: 'network-only',
    });

    if (isDefined(currentUserResult.error)) {
      throw new Error(currentUserResult.error.message);
    }

    const user = currentUserResult.data?.currentUser;

    if (!user) {
      throw new Error('No current user result');
    }

    let workspaceMember = null;

    setCurrentUser(user);

    if (isDefined(user.workspaceMembers)) {
      setCurrentWorkspaceMembers(user.workspaceMembers);
    }

    if (isDefined(user.availableWorkspaces)) {
      setAvailableWorkspaces(user.availableWorkspaces);
    }

    if (isDefined(user.currentUserWorkspace)) {
      setCurrentUserWorkspace({
        permissionFlags: user.currentUserWorkspace.permissionFlags ?? [],
        twoFactorAuthenticationMethodSummary:
          user.currentUserWorkspace.twoFactorAuthenticationMethodSummary ?? [],
        objectsPermissions:
          (user.currentUserWorkspace.objectsPermissions as Array<
            ObjectPermissions & { objectMetadataId: string }
          >) ?? [],
      });
    }

    if (isDefined(user.workspaceMember)) {
      workspaceMember = {
        ...user.workspaceMember,
        colorScheme: user.workspaceMember?.colorScheme as ColorScheme,
        locale: user.workspaceMember?.locale ?? SOURCE_LOCALE,
      };

      setCurrentWorkspaceMember(workspaceMember);

      // Initialize unified format preferences state
      initializeFormatPreferences(workspaceMember);
      dynamicActivate(
        (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      );
    }

    const workspace = isDefined(user.currentWorkspace)
      ? {
          ...user.currentWorkspace,
          workspaceCustomApplication:
            user.currentWorkspace.workspaceCustomApplication ?? null,
        }
      : null;

    setCurrentWorkspace(workspace);

    if (isDefined(workspace)) {
      setWorkspaceAuthBypassProviders({
        google: authProviders.google && workspace.isGoogleAuthBypassEnabled,
        microsoft:
          authProviders.microsoft && workspace.isMicrosoftAuthBypassEnabled,
        password:
          authProviders.password && workspace.isPasswordAuthBypassEnabled,
      });
    }

    if (isDefined(workspace) && isOnAWorkspace) {
      setLastAuthenticateWorkspaceDomain({
        workspaceId: workspace.id,
        workspaceUrl: getWorkspaceUrl(workspace.workspaceUrls),
      });
    }

    if (isDefined(coreViewsResult.data?.getCoreViews)) {
      setCoreViews(coreViewsResult.data.getCoreViews);
    }

    return {
      user,
      workspaceMember,
      workspace,
    };
  }, [
    getCurrentUser,
    findAllCoreViews,
    setCurrentUser,
    setCurrentWorkspace,
    isOnAWorkspace,
    setCurrentWorkspaceMembers,
    setAvailableWorkspaces,
    setCurrentUserWorkspace,
    setCurrentWorkspaceMember,
    initializeFormatPreferences,
    setLastAuthenticateWorkspaceDomain,
    setCoreViews,
    authProviders,
    setWorkspaceAuthBypassProviders,
  ]);

  return {
    loadCurrentUser,
  };
};
