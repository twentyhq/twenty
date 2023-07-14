import { CustomHotkeysScopes } from '../types/CustomHotkeysScope';
import { HotkeysScope } from '../types/HotkeysScope';
import { InternalHotkeysScope } from '../types/internal/InternalHotkeysScope';

export const INITIAL_HOTKEYS_SCOPES: string[] = [InternalHotkeysScope.App];

export const ALWAYS_ON_HOTKEYS_SCOPES: string[] = [
  InternalHotkeysScope.CommandMenu,
  InternalHotkeysScope.App,
];

export const DEFAULT_HOTKEYS_SCOPE_CUSTOM_SCOPES: CustomHotkeysScopes = {
  commandMenu: true,
  goto: false,
};

export const INITIAL_HOTKEYS_SCOPE: HotkeysScope = {
  scope: InternalHotkeysScope.App,
  customScopes: {
    commandMenu: true,
    goto: true,
  },
};
