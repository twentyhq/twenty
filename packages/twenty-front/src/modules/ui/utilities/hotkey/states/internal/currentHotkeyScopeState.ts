import { createState } from '@ui/utilities/state/utils/createState';

import { INITIAL_HOTKEYS_SCOPE } from '../../constants/InitialHotkeysScope';
import { HotkeyScope } from '../../types/HotkeyScope';

export const currentHotkeyScopeState = createState<HotkeyScope>({
  key: 'currentHotkeyScopeState',
  defaultValue: INITIAL_HOTKEYS_SCOPE,
});
