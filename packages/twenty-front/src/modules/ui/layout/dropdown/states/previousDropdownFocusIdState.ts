import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const previousDropdownFocusIdState = createStateV2<string | null>({
  key: 'previousDropdownFocusIdState',
  defaultValue: null,
});
