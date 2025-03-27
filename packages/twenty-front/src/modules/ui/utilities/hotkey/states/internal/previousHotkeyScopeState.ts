import { HotkeyScope } from '../../types/HotkeyScope';
import { createState } from 'twenty-ui/utilities';

export const previousHotkeyScopeState = createState<HotkeyScope | null>({
  key: 'previousHotkeyScopeState',
  defaultValue: null,
});
