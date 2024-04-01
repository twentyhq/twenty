import { createState } from 'twenty-ui';

export const lockedListenerIdState = createState<string | null>({
  key: 'lockedListenerIdState',
  defaultValue: null,
});
