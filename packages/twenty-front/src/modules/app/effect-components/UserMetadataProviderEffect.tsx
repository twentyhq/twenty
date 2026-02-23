import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { availableWorkspacesState } from '@/auth/states/availableWorkspacesState';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceDeletedMembersState } from '@/auth/states/currentWorkspaceDeletedMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useInitializeFormatPreferences } from '@/localization/hooks/useInitializeFormatPreferences';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale.util';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { useLocation } from 'react-router-dom';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { AppPath, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetCurrentUserQuery,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dateLocaleStateV2 } from '~/localization/states/dateLocaleStateV2';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const UserMetadataProviderEffect = () => {
  const location = useLocation();
  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);
  const store = useStore();

  const setCurrentUser = useSetRecoilStateV2(currentUserState);
  const setCurrentWorkspace = useSetRecoilStateV2(currentWorkspaceState);
  const setCurrentUserWorkspace = useSetRecoilStateV2(
    currentUserWorkspaceState,
  );
  const setAvailableWorkspaces = useSetRecoilStateV2(availableWorkspacesState);
  const setCurrentWorkspaceMember = useSetRecoilStateV2(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspaceMembers = useSetRecoilStateV2(
    currentWorkspaceMembersState,
  );
  const setCurrentWorkspaceMembersWithDeleted = useSetRecoilStateV2(
    currentWorkspaceDeletedMembersState,
  );

  const { initializeFormatPreferences } = useInitializeFormatPreferences();

  const isOnAuthPath =
    isMatchingLocation(location, AppPath.Verify) ||
    isMatchingLocation(location, AppPath.VerifyEmail);

  const updateLocaleCatalog = useRecoilCallback(
    ({ snapshot, set }) =>
      async (newLocale: keyof typeof APP_LOCALES) => {
        const localeValue = snapshot.getLoadable(dateLocaleState).getValue();
        if (localeValue.locale !== newLocale) {
          getDateFnsLocale(newLocale).then((localeCatalog) => {
            const newValue = {
              locale: newLocale,
              localeCatalog: localeCatalog || enUS,
            };
            set(dateLocaleState, newValue);
            store.set(dateLocaleStateV2.atom, newValue);
          });
        }
      },
    [store],
  );

  const shouldSkipUserQuery =
    !isLoggedIn || isDefined(currentUser) || isOnAuthPath;

  const { data: userQueryData, loading: userQueryLoading } =
    useGetCurrentUserQuery({
      skip: shouldSkipUserQuery,
    });

  useEffect(() => {
    if (userQueryLoading || !isDefined(userQueryData?.currentUser)) {
      return;
    }

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
    initializeFormatPreferences,
    setCurrentWorkspaceMembersWithDeleted,
    updateLocaleCatalog,
  ]);

  return null;
};
