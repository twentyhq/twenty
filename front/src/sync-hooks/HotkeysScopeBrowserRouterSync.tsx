import { useEffect } from 'react';

import { useSetHotkeysScope } from '@/lib/hotkeys/hooks/useSetHotkeysScope';
import { HotkeyScope as TableHotkeyScope } from '@/ui/tables/types/HotkeyScope';

import { useIsMatchingLocation } from './hooks/useIsMatchingLocation';
import { AppBasePath } from './types/AppBasePath';
import { AppPath } from './types/AppPath';
import { AuthPath } from './types/AuthPath';
import { PageHotkeysScope } from './types/PageHotkeysScope';
import { SettingsPath } from './types/SettingsPath';

export function HotkeysScopeBrowserRouterSync() {
  const isMatchingLocation = useIsMatchingLocation();

  const setHotkeysScope = useSetHotkeysScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(AppBasePath.Root, AppPath.CompaniesPage): {
        setHotkeysScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.PeoplePage): {
        setHotkeysScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.CompanyShowPage): {
        setHotkeysScope(PageHotkeysScope.CompanyShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.PersonShowPage): {
        setHotkeysScope(PageHotkeysScope.PersonShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Root, AppPath.OpportunitiesPage): {
        setHotkeysScope(PageHotkeysScope.OpportunitiesPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.Index): {
        setHotkeysScope(PageHotkeysScope.AuthIndex);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.CreateProfile): {
        setHotkeysScope(PageHotkeysScope.CreateProfile);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.CreateWorkspace): {
        setHotkeysScope(PageHotkeysScope.CreateWokspace);
        break;
      }
      case isMatchingLocation(AppBasePath.Auth, AuthPath.PasswordLogin): {
        setHotkeysScope(PageHotkeysScope.PasswordLogin);
        break;
      }
      case isMatchingLocation(AppBasePath.Settings, SettingsPath.ProfilePage): {
        setHotkeysScope(PageHotkeysScope.ProfilePage, { goto: true });
        break;
      }
      case isMatchingLocation(
        AppBasePath.Settings,
        SettingsPath.WorkspaceMembersPage,
      ): {
        setHotkeysScope(PageHotkeysScope.WorkspaceMemberPage, { goto: true });
        break;
      }
    }
  }, [isMatchingLocation, setHotkeysScope]);

  return <></>;
}
