import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'previousHotkeyScopeState',
  defaultValue: null,
});
