import { useEffect } from 'react';

import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
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
      case isMatchingLocation(AppPath.CompaniesPage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.PeoplePage): {
        setHotkeyScope(TableHotkeyScope.Table, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.CompanyShowPage): {
        setHotkeyScope(PageHotkeyScope.CompanyShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.PersonShowPage): {
        setHotkeyScope(PageHotkeyScope.PersonShowPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.OpportunitiesPage): {
        setHotkeyScope(PageHotkeyScope.OpportunitiesPage, { goto: true });
        break;
      }
      case isMatchingLocation(AppPath.SignIn): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.SignUp): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.Invite): {
        setHotkeyScope(PageHotkeyScope.SignInUp);
        break;
      }
      case isMatchingLocation(AppPath.CreateProfile): {
        setHotkeyScope(PageHotkeyScope.CreateProfile);
        break;
      }
      case isMatchingLocation(AppPath.CreateWorkspace): {
        setHotkeyScope(PageHotkeyScope.CreateWokspace);
        break;
      }
      case isMatchingLocation(SettingsPath.ProfilePage, AppBasePath.Settings): {
        setHotkeyScope(PageHotkeyScope.ProfilePage, { goto: true });
        break;
      }
      case isMatchingLocation(
        SettingsPath.WorkspaceMembersPage,
        AppBasePath.Settings,
      ): {
        setHotkeyScope(PageHotkeyScope.WorkspaceMemberPage, { goto: true });
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
}
