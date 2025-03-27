import { INITIAL_HOTKEYS_SCOPE } from '../../constants/InitialHotkeysScope';
import { HotkeyScope } from '../../types/HotkeyScope';
import { createState } from 'twenty-ui/utilities';

export const currentHotkeyScopeState = createState<HotkeyScope>({
  key: 'currentHotkeyScopeState',
  defaultValue: INITIAL_HOTKEYS_SCOPE,
});
