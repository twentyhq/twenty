import { AppHotkeyScope } from '../types/AppHotkeyScope';
import { CustomHotkeyScopes } from '../types/CustomHotkeyScope';
import { HotkeyScope } from '../types/HotkeyScope';

export const INITIAL_HOTKEYS_SCOPES: string[] = [AppHotkeyScope.App];

export const ALWAYS_ON_HOTKEYS_SCOPES: string[] = [
  AppHotkeyScope.CommandMenu,
  AppHotkeyScope.App,
];

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
  _internalId: 'initial',
};
