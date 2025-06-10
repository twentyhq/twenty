import { createFamilyState } from '@/ui/utilities/state/utils/createFamilyState';

import { HotkeyScope } from '../../types/HotkeyScope';

export const previousHotkeyScopeFamilyState = createFamilyState<
  HotkeyScope | null,
  string
>({
  key: 'previousHotkeyScopeFamilyState',
  defaultValue: null,
});
