import { createState } from 'twenty-ui/utilities';

export const activeDropdownFocusIdState = createState<string | null>({
  key: 'activeDropdownFocusIdState',
  defaultValue: null,
});
