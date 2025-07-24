import { createState } from 'twenty-ui/utilities';

export const lastVisitedObjectFieldState = createState<string | null>({
  key: 'lastVisitedObjectFieldState',
  defaultValue: null,
});
