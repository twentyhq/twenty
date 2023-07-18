import { useEffect } from 'react';

import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { AuthPath } from '@/types/AuthPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { useSetHotkeyScope } from '@/ui/hotkey/hooks/useSetHotkeyScope';
import { TableHotkeyScope } from '@/ui/table/types/TableHotkeyScope';
import { useIsMatchingLocation } from '~/hooks/useIsMatchingLocation';

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
