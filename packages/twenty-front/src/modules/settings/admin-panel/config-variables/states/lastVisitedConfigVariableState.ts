import { createState } from 'twenty-ui/utilities';

export const lastVisitedConfigVariableState = createState<string | null>({
  key: 'lastVisitedConfigVariableState',
  defaultValue: null,
});
