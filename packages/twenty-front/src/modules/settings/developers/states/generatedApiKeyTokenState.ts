import { createState } from 'twenty-ui';

export const apiKeyTokenState = createState<string | null>({
  key: 'apiKeyTokenState',
  defaultValue: null,
});
