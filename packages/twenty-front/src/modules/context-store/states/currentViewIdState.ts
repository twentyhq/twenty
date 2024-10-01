import { createState } from 'twenty-ui';

export const currentViewIdState = createState<string | null>({
  key: 'currentViewIdState',
  defaultValue: null,
});
