import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { detectDateFormat } from '@/localization/utils/detectDateFormat';
import { detectTimeFormat } from '@/localization/utils/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detectTimeZone';
import { getDateFormatFromWorkspaceDateFormat } from '@/localization/utils/getDateFormatFromWorkspaceDateFormat';
import { getTimeFormatFromWorkspaceTimeFormat } from '@/localization/utils/getTimeFormatFromWorkspaceTimeFormat';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { AppPath, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceMember,
  useGetCurrentUserQuery,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserProviderEffect = () => {
  const location = useLocation();

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);
  const setAvailableWorkspaces = useSetRecoilState(availableWorkspacesState);
  const setDateTimeFormat = useSetRecoilState(dateTimeFormatState);
  const isLoggedIn = useIsLogged();

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

  const setCoreViews = useRecoilCallback(
    ({ set, snapshot }) =>
      (coreViews: CoreViewWithRelations[]) => {
        const existingCoreViews = snapshot
          .getLoadable(coreViewsState)
          .getValue();

        if (!isDeeplyEqual(existingCoreViews, coreViews)) {
          set(coreViewsState, coreViews);
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

  const { data: queryData, loading: queryLoading } = useGetCurrentUserQuery({
    skip:
      !isLoggedIn ||
      isCurrentUserLoaded ||
      isMatchingLocation(location, AppPath.Verify) ||
      isMatchingLocation(location, AppPath.VerifyEmail),
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsCurrentUserLoaded(true);
    }

    if (!isDefined(queryData?.currentUser)) return;

    setCurrentUser(queryData.currentUser);

    if (isDefined(queryData.currentUser.currentWorkspace)) {
      setCurrentWorkspace({
        ...queryData.currentUser.currentWorkspace,
        defaultRole: queryData.currentUser.currentWorkspace.defaultRole ?? null,
        defaultAgent:
          queryData.currentUser.currentWorkspace.defaultAgent ?? null,
      });
    }

    if (isDefined(queryData.currentUser.currentUserWorkspace)) {
      setCurrentUserWorkspace({
        ...queryData.currentUser.currentUserWorkspace,
        objectsPermissions:
          (queryData.currentUser.currentUserWorkspace
            .objectsPermissions as Array<
            ObjectPermissions & { objectMetadataId: string }
          >) ?? [],
      });
    }

    if (isDefined(queryData.currentUser?.currentWorkspace?.views)) {
      setCoreViews(queryData.currentUser.currentWorkspace.views);
    }

    const {
      workspaceMember,
      workspaceMembers,
      deletedWorkspaceMembers,
      availableWorkspaces,
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
      setCurrentWorkspaceMembers(workspaceMembers);
    }

    if (isDefined(deletedWorkspaceMembers)) {
      setCurrentWorkspaceMembersWithDeleted(deletedWorkspaceMembers);
    }

    if (isDefined(availableWorkspaces)) {
      setAvailableWorkspaces(availableWorkspaces);
    }
  }, [
    queryLoading,
    queryData?.currentUser,
    setCurrentUser,
    setCurrentUserWorkspace,
    setCurrentWorkspaceMembers,
    setAvailableWorkspaces,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setIsCurrentUserLoaded,
    setDateTimeFormat,
    setCurrentWorkspaceMembersWithDeleted,
    updateLocaleCatalog,
    setCoreViews,
  ]);

  return null;
};
