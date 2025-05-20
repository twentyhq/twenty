import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { CustomHotkeyScopes } from '@/ui/utilities/hotkey/types/CustomHotkeyScope';

export type FocusStackItem = {
  focusIdentifier: FocusIdentifier;
  customScopes?: CustomHotkeyScopes;
};
