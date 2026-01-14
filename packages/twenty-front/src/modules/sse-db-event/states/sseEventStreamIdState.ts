import { createState } from 'twenty-ui/utilities';

export const sseEventStreamIdState = createState<string | null>({
  key: 'sseEventStreamIdState',
  defaultValue: null,
});
