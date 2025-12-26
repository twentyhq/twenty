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
import { useInitializeFormatPreferences } from '@/localization/hooks/useInitializeFormatPreferences';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithRelations } from '@/views/types/CoreViewWithRelations';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { AppPath, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type WorkspaceMember,
  useFindAllCoreViewsQuery,
  useGetCurrentUserQuery,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserAndViewsProviderEffect = () => {
  const location = useLocation();

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useRecoilState(
    isCurrentUserLoadedState,
  );

  const [localIsCurrentUserLoaded, setLocalIsCurrentUserLoaded] =
    useState(false);
  const [localAreViewsLoaded, setLocalAreViewsLoaded] = useState(false);

  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);
  const setAvailableWorkspaces = useSetRecoilState(availableWorkspacesState);
  const { initializeFormatPreferences } = useInitializeFormatPreferences();
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

  const shouldSkip =
    !isLoggedIn ||
    isCurrentUserLoaded ||
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const { data: userQueryData, loading: userQueryLoading } =
    useGetCurrentUserQuery({
      skip: shouldSkip,
    });

  const { data: queryDataCoreViews, loading: queryLoadingCoreViews } =
    useFindAllCoreViewsQuery({
      skip: shouldSkip,
    });

  useEffect(() => {
    if (!userQueryLoading) {
      setLocalIsCurrentUserLoaded(true);
    }

    if (!isDefined(userQueryData?.currentUser)) return;

    setCurrentUser(userQueryData.currentUser);

    if (isDefined(userQueryData.currentUser.currentWorkspace)) {
      setCurrentWorkspace({
        ...userQueryData.currentUser.currentWorkspace,
        defaultRole:
          userQueryData.currentUser.currentWorkspace.defaultRole ?? null,
        workspaceCustomApplication:
          userQueryData.currentUser.currentWorkspace
            .workspaceCustomApplication ?? null,
      });
    }

    if (isDefined(userQueryData.currentUser.currentUserWorkspace)) {
      setCurrentUserWorkspace({
        permissionFlags:
          userQueryData.currentUser.currentUserWorkspace.permissionFlags ?? [],
        twoFactorAuthenticationMethodSummary:
          userQueryData.currentUser.currentUserWorkspace
            .twoFactorAuthenticationMethodSummary ?? [],
        objectsPermissions:
          (userQueryData.currentUser.currentUserWorkspace
            .objectsPermissions as Array<
            ObjectPermissions & { objectMetadataId: string }
          >) ?? [],
      });
    }

    const {
      workspaceMember,
      workspaceMembers,
      deletedWorkspaceMembers,
      availableWorkspaces,
    } = userQueryData.currentUser;

    const affectDefaultValuesOnEmptyWorkspaceMemberFields = (
      workspaceMember: WorkspaceMember,
    ) => {
      return {
        ...workspaceMember,
        colorScheme: (workspaceMember.colorScheme as ColorScheme) ?? 'System',
        locale:
          (workspaceMember.locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE,
      };
    };

    if (isDefined(workspaceMember)) {
      const updatedWorkspaceMember =
        affectDefaultValuesOnEmptyWorkspaceMemberFields(workspaceMember);
      setCurrentWorkspaceMember(updatedWorkspaceMember);

      updateLocaleCatalog(updatedWorkspaceMember.locale);

      // Initialize format preferences from workspace member
      initializeFormatPreferences(updatedWorkspaceMember);

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
    userQueryLoading,
    userQueryData?.currentUser,
    setCurrentUser,
    setCurrentUserWorkspace,
    setCurrentWorkspaceMembers,
    setAvailableWorkspaces,
    setCurrentWorkspace,
    setCurrentWorkspaceMember,
    setIsCurrentUserLoaded,
    initializeFormatPreferences,
    setCurrentWorkspaceMembersWithDeleted,
    updateLocaleCatalog,
    setCoreViews,
  ]);

  useEffect(() => {
    if (!queryLoadingCoreViews) {
      setLocalAreViewsLoaded(true);
    }

    if (!isDefined(queryDataCoreViews?.getCoreViews)) return;

    setCoreViews(queryDataCoreViews.getCoreViews);
  }, [queryDataCoreViews?.getCoreViews, setCoreViews, queryLoadingCoreViews]);

  useEffect(() => {
    if (localIsCurrentUserLoaded && localAreViewsLoaded) {
      setIsCurrentUserLoaded(true);
    }
  }, [localIsCurrentUserLoaded, localAreViewsLoaded, setIsCurrentUserLoaded]);

  return null;
};
