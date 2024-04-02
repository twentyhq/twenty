import { createState } from 'twenty-ui';

import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = createState<HotkeyScope | null>({
  key: 'previousHotkeyScopeState',
  defaultValue: null,
});
