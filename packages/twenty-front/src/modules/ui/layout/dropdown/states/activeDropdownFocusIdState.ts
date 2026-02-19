import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const activeDropdownFocusIdState = createStateV2<string | null>({
  key: 'activeDropdownFocusIdState',
  defaultValue: null,
});
