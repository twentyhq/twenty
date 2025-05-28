import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersStates';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { workspacesState } from '@/auth/states/workspaces';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { AppPath } from '@/types/AppPath';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useLocation } from 'react-router-dom';
import { APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceMember } from '~/generated-metadata/graphql';
import { useGetCurrentUserQuery } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProviderEffect = () => {
  console.log('[UserProviderEffect] Component rendered');

  const location = useLocation();

  console.log('[UserProviderEffect] Location:', location.pathname);

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );

  console.log('[UserProviderEffect] isCurrentUserLoaded:', isCurrentUserLoaded);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);
  const setWorkspaces = useSetRecoilState(workspacesState);
  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);
  const updateLocaleCatalog = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newLocale: keyof typeof APP_LOCALES) => {
        const localeValue = snapshot.getLoadable(dateLocaleState).getValue();
        if (localeValue.locale !== newLocale) {
          getDateFnsLocale(newLocale).then((localeCatalog) => {
            set(dateLocaleState, {
              locale: newLocale,
              localeCatalog: localeCatalog || enUS,
            });
          });
        }
      },
    [],
  );

  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspaceMembers = useSetRecoilState(
    currentWorkspaceMembersState,
  );
  const setCurrentWorkspaceMembersWithDeleted = useSetRecoilState(
    currentWorkspaceDeletedMembersState,
  );

  const skipQuery =
    isCurrentUserLoaded ||
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  console.log('[UserProviderEffect] Query skip conditions:', {
    isCurrentUserLoaded,
    isVerifyPath: isMatchingLocation(location, AppPath.Verify),
    isVerifyEmailPath: isMatchingLocation(location, AppPath.VerifyEmail),
    skipQuery,
  });

  const { loading: queryLoading, data: queryData } = useGetCurrentUserQuery({
    skip: skipQuery,
  });

  console.log('[UserProviderEffect] Query state:', {
    queryLoading,
    hasData: !!queryData,
    hasCurrentUser: !!queryData?.currentUser,
  });

  useEffect(() => {
    console.log('[UserProviderEffect] useEffect triggered with:', {
      queryLoading,
      hasQueryData: !!queryData,
      hasCurrentUser: !!queryData?.currentUser,
      isCurrentUserLoaded,
    });

    if (!queryLoading) {
      console.log(
        '[UserProviderEffect] Query finished loading, setting states',
      );
      setIsCurrentUserLoaded(true);
    }

    if (!isDefined(queryData?.currentUser) || skipQuery) {
      console.log(
        '[UserProviderEffect] No current user data or query skipped, returning early',
      );
      return;
    }

    console.log('[UserProviderEffect] Processing current user data');
    setCurrentUser(queryData.currentUser);

    if (isDefined(queryData.currentUser.currentWorkspace)) {
      console.log('[UserProviderEffect] Setting current workspace');
      setCurrentWorkspace({
        ...queryData.currentUser.currentWorkspace,
        defaultRole: queryData.currentUser.currentWorkspace.defaultRole ?? null,
      });
    }

    if (isDefined(queryData.currentUser.currentUserWorkspace)) {
      console.log('[UserProviderEffect] Setting current user workspace');
      setCurrentUserWorkspace(queryData.currentUser.currentUserWorkspace);
    }

    const {
      workspaceMember,
      workspaceMembers,
      deletedWorkspaceMembers,
      workspaces: userWorkspaces,
    } = queryData.currentUser;

    const affectDefaultValuesOnEmptyWorkspaceMemberFields = (
      workspaceMember: WorkspaceMember,
    ) => {
      return {
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'Light',
        locale:
          (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      };
    };

    if (isDefined(workspaceMember)) {
      console.log('[UserProviderEffect] Processing workspace member');
      const updatedWorkspaceMember =
        affectDefaultValuesOnEmptyWorkspaceMemberFields(workspaceMember);
      setCurrentWorkspaceMember(updatedWorkspaceMember);

      updateLocaleCatalog(updatedWorkspaceMember.locale);

      // TODO: factorize
      setDateTimeFormat({
        timeZone:
          workspaceMember.timeZone && workspaceMember.timeZone !== 'system'
            ? workspaceMember.timeZone
            : detectTimeZone(),
        dateFormat: isDefined(workspaceMember.dateFormat)
          ? getDateFormatFromWorkspaceDateFormat(workspaceMember.dateFormat)
          : DateFormat[detectDateFormat()],
        timeFormat: isDefined(workspaceMember.timeFormat)
          ? getTimeFormatFromWorkspaceTimeFormat(workspaceMember.timeFormat)
          : TimeFormat[detectTimeFormat()],
      });

      dynamicActivate(
        (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      );
    }

    if (isDefined(workspaceMembers)) {
      console.log(
        '[UserProviderEffect] Setting workspace members, count:',
        workspaceMembers.length,
      );
      setCurrentWorkspaceMembers(
        workspaceMembers.map(affectDefaultValuesOnEmptyWorkspaceMemberFields) ??
          [],
      );
    }

    if (isDefined(deletedWorkspaceMembers)) {
      console.log(
        '[UserProviderEffect] Setting deleted workspace members, count:',
        deletedWorkspaceMembers.length,
      );
      setCurrentWorkspaceMembersWithDeleted(deletedWorkspaceMembers);
    }

    if (isDefined(userWorkspaces)) {
      const workspaces = userWorkspaces
        .map(({ workspace }) => workspace)
        .filter(isDefined);

      console.log(
        '[UserProviderEffect] Setting workspaces, count:',
        workspaces.length,
      );
      setWorkspaces(workspaces);
    }
  }, [
    setCurrentUser,
    setCurrentUserWorkspace,
    setCurrentWorkspaceMembers,
    queryLoading,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setWorkspaces,
    queryData?.currentUser,
    setIsCurrentUserLoaded,
    setDateTimeFormat,
    setCurrentWorkspaceMembersWithDeleted,
    updateLocaleCatalog,
    skipQuery,
  ]);

  return <></>;
};
