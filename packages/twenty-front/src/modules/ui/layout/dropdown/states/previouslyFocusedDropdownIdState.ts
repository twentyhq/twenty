import { createState } from 'twenty-ui';

export const previouslyFocusedDropdownIdState = createState<string | null>({
  key: 'previouslyFocusedDropdownIdState',
  defaultValue: null,
});
