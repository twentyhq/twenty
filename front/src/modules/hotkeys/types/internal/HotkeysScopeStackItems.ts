import { CustomHotkeysScopes } from '@/hotkeys/states/internal/customHotkeysScopesState';

export type HotkeysScopeStackItem = {
  scope: string;
  customScopes?: CustomHotkeysScopes;
  ancestorScope?: string | null;
};
