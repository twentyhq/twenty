import { createState } from 'twenty-ui';

export const previousDropdownFocusIdState = createState<string | null>({
  key: 'previousDropdownFocusIdState',
  defaultValue: null,
});
