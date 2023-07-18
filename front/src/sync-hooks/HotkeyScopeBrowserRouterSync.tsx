import { useEffect } from 'react';

import { useSetHotkeyScope } from '@/lib/hotkeys/hooks/useSetHotkeyScope';
import { TableHotkeyScope } from '@/ui/tables/types/TableHotkeyScope';

import { useIsMatchingLocation } from './hooks/useIsMatchingLocation';
import { AppBasePath } from './types/AppBasePath';
import { AppPath } from './types/AppPath';
import { AuthPath } from './types/AuthPath';
import { PageHotkeyScope } from './types/PageHotkeyScope';
import { SettingsPath } from './types/SettingsPath';

export function HotkeyScopeBrowserRouterSync() {
  const isMatchingLocation = useIsMatchingLocation();

  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(AppBasePath.Root, AppPath.CompaniesPage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.PeoplePage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.CompanyShowPage): {
        setHotkeyScope(PageHotkeyScope.CompanyShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.PersonShowPage): {
        setHotkeyScope(PageHotkeyScope.PersonShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.OpportunitiesPage): {
        setHotkeyScope(PageHotkeyScope.OpportunitiesPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.Index): {
        setHotkeyScope(PageHotkeyScope.AuthIndex);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.CreateProfile): {
        setHotkeyScope(PageHotkeyScope.CreateProfile);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.CreateWorkspace): {
        setHotkeyScope(PageHotkeyScope.CreateWokspace);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.PasswordLogin): {
        setHotkeyScope(PageHotkeyScope.PasswordLogin);
        break;
      }
      case isMatchingLocation(AppBasePath.Settings, SettingsPath.ProfilePage): {
        setHotkeyScope(PageHotkeyScope.ProfilePage, { goto: true });
        break;
      }
      case isMatchingLocation(
        AppBasePath.Settings,
        SettingsPath.WorkspaceMembersPage,
      ): {
        setHotkeyScope(PageHotkeyScope.WorkspaceMemberPage, { goto: true });
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
}
