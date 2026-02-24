import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const activeDropdownFocusIdState = createState<string | null>({
  key: 'activeDropdownFocusIdState',
  defaultValue: null,
});
