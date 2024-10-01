import { createState } from 'twenty-ui';

export const contextStoreCurrentViewIdState = createState<string | null>({
  key: 'contextStoreCurrentViewIdState',
  defaultValue: null,
});
