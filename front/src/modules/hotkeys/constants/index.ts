import { HotkeysScopeStackItem } from '../types/internal/HotkeysScopeStackItems';
import { InternalHotkeysScope } from '../types/internal/InternalHotkeysScope';

export const INITIAL_HOTKEYS_SCOPES: string[] = [InternalHotkeysScope.App];

export const ALWAYS_ON_HOTKEYS_SCOPES: string[] = [
  InternalHotkeysScope.CommandMenu,
  InternalHotkeysScope.App,
];

export const DEFAULT_HOTKEYS_SCOPE_STACK_ITEM: HotkeysScopeStackItem = {
  scope: InternalHotkeysScope.App,
  customScopes: {
    'command-menu': true,
    goto: true,
  },
};
