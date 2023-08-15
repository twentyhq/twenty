import { AppHotkeyScope } from '../types/AppHotkeyScope';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

export const DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES: CustomHotkeyScopes = {
  commandMenu: true,
  goto: false,
};

export const INITIAL_HOTKEYS_SCOPE: HotkeyScope = {
  scope: AppHotkeyScope.App,
  customScopes: {
    commandMenu: true,
    goto: true,
  },
};
