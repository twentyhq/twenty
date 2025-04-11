import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { AppBasePath } from '@/types/AppBasePath';
import { AppPath } from '@/types/AppPath';
import { PageHotkeyScope } from '@/types/PageHotkeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';

type SetHotkeyScopeFunction = (
  scope: string,
  customScopes?: CustomHotkeyScopes,
) => void;
type IsMatchingLocationFunction = (
  path: string,
  basePath?: AppBasePath,
) => boolean;

export const setHotkeyScopeForPath = (
  isMatchingLocation: IsMatchingLocationFunction,
  setHotkeyScope: SetHotkeyScopeFunction,
) => {
  switch (true) {
    case isMatchingLocation(AppPath.RecordIndexPage): {
      setHotkeyScope(TableHotkeyScope.Table, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(AppPath.RecordShowPage): {
      setHotkeyScope(PageHotkeyScope.CompanyShowPage, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(AppPath.OpportunitiesPage): {
      setHotkeyScope(PageHotkeyScope.OpportunitiesPage, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(AppPath.TasksPage): {
      setHotkeyScope(PageHotkeyScope.TaskPage, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(AppPath.SignInUp): {
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
      setHotkeyScope(PageHotkeyScope.CreateWorkspace);
      break;
    }
    case isMatchingLocation(AppPath.SyncEmails): {
      setHotkeyScope(PageHotkeyScope.SyncEmail);
      break;
    }
    case isMatchingLocation(AppPath.InviteTeam): {
      setHotkeyScope(PageHotkeyScope.InviteTeam);
      break;
    }
    case isMatchingLocation(AppPath.PlanRequired): {
      setHotkeyScope(PageHotkeyScope.PlanRequired);
      break;
    }
    case isMatchingLocation(SettingsPath.ProfilePage, AppBasePath.Settings): {
      setHotkeyScope(PageHotkeyScope.ProfilePage, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(SettingsPath.Domain, AppBasePath.Settings): {
      setHotkeyScope(PageHotkeyScope.Settings, {
        goto: false,
        keyboardShortcutMenu: true,
      });
      break;
    }
    case isMatchingLocation(
      SettingsPath.WorkspaceMembersPage,
      AppBasePath.Settings,
    ): {
      setHotkeyScope(PageHotkeyScope.WorkspaceMemberPage, {
        goto: true,
        keyboardShortcutMenu: true,
      });
      break;
    }
  }
};
