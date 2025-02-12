import { createState } from '@ui/utilities/state/utils/createState';

import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = createState<HotkeyScope | null>({
  key: 'previousHotkeyScopeState',
  defaultValue: null,
});
