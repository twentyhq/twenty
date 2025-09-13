import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsCurrentLocationOnAWorkspace } from '@/domain-manager/hooks/useIsCurrentLocationOnAWorkspace';
import { useLastAuthenticatedWorkspaceDomain } from '@/domain-manager/hooks/useLastAuthenticatedWorkspaceDomain';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { coreViewsState } from '@/views/states/coreViewState';
import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { SOURCE_LOCALE, type APP_LOCALES } from 'twenty-shared/translations';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ColorScheme } from 'twenty-ui/input';
import { useGetCurrentUserLazyQuery } from '~/generated-metadata/graphql';
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
  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);
  const setCoreViews = useSetRecoilState(coreViewsState);

  const { isOnAWorkspace } = useIsCurrentLocationOnAWorkspace();

  const [getCurrentUser] = useGetCurrentUserLazyQuery();

  const loadCurrentUser = useCallback(async () => {
    const currentUserResult = await getCurrentUser({
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
        ...user.currentUserWorkspace,
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

      // TODO: factorize with UserProviderEffect
      setDateTimeFormat({
        timeZone:
          workspaceMember.timeZone && workspaceMember.timeZone !== 'system'
            ? workspaceMember.timeZone
            : detectTimeZone(),
        dateFormat: isDefined(user.workspaceMember.dateFormat)
          ? getDateFormatFromWorkspaceDateFormat(
              user.workspaceMember.dateFormat,
            )
          : DateFormat[detectDateFormat()],
        timeFormat: isDefined(user.workspaceMember.timeFormat)
          ? getTimeFormatFromWorkspaceTimeFormat(
              user.workspaceMember.timeFormat,
            )
          : TimeFormat[detectTimeFormat()],
      });
      dynamicActivate(
        (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      );
    }

    const workspace = user.currentWorkspace ?? null;

    setCurrentWorkspace(workspace);

    if (isDefined(workspace) && isOnAWorkspace) {
      setLastAuthenticateWorkspaceDomain({
        workspaceId: workspace.id,
        workspaceUrl: getWorkspaceUrl(workspace.workspaceUrls),
      });
    }

    if (isDefined(workspace) && isDefined(workspace.views)) {
      setCoreViews(workspace.views);
    }

    return {
      user,
      workspaceMember,
      workspace,
    };
  }, [
    getCurrentUser,
    isOnAWorkspace,
    setAvailableWorkspaces,
    setCoreViews,
    setCurrentUser,
    setCurrentUserWorkspace,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setCurrentWorkspaceMembers,
    setDateTimeFormat,
    setLastAuthenticateWorkspaceDomain,
  ]);

  return {
    loadCurrentUser,
  };
};
