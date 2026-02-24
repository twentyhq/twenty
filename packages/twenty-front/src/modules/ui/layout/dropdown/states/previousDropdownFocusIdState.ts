import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const previousDropdownFocusIdState = createState<string | null>({
  key: 'previousDropdownFocusIdState',
  defaultValue: null,
});
