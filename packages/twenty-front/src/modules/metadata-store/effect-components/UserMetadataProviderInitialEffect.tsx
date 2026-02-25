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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { enUS } from 'date-fns/locale';
import { useStore } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetCurrentUserQuery,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const UserMetadataProviderInitialEffect = () => {
  const isLoggedIn = useIsLogged();
  const currentUser = useAtomStateValue(currentUserState);
  const store = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const setCurrentUser = useSetAtomState(currentUserState);
  const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
  const setCurrentUserWorkspace = useSetAtomState(currentUserWorkspaceState);
  const setAvailableWorkspaces = useSetAtomState(availableWorkspacesState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );
  const setCurrentWorkspaceMembers = useSetAtomState(
    currentWorkspaceMembersState,
  );
  const setCurrentWorkspaceMembersWithDeleted = useSetAtomState(
    currentWorkspaceDeletedMembersState,
  );
  const setIsCurrentUserLoaded = useSetAtomState(isCurrentUserLoadedState);

  const { initializeFormatPreferences } = useInitializeFormatPreferences();

  const updateLocaleCatalog = useCallback(
    async (newLocale: keyof typeof APP_LOCALES) => {
      const localeValue = store.get(dateLocaleState.atom);
      if (localeValue.locale !== newLocale) {
        getDateFnsLocale(newLocale).then((localeCatalog) => {
          const newValue = {
            locale: newLocale,
            localeCatalog: localeCatalog || enUS,
          };
          store.set(dateLocaleState.atom, newValue);
        });
      }
    },
    [store],
  );

  const shouldSkipUserQuery = !isLoggedIn || isDefined(currentUser);

  const { data: userQueryData, loading: userQueryLoading } =
    useGetCurrentUserQuery({
      skip: shouldSkipUserQuery,
    });

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    if (!isLoggedIn) {
      setIsCurrentUserLoaded(true);
      setIsInitialized(true);
      return;
    }

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

    setIsCurrentUserLoaded(true);
    setIsInitialized(true);
  }, [
    isInitialized,
    isLoggedIn,
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
    setIsCurrentUserLoaded,
  ]);

  return null;
};
