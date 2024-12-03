import { createState } from 'twenty-ui';

export const focusedDropdownIdState = createState<string | null>({
  key: 'focusedDropdownIdState',
  defaultValue: null,
});
