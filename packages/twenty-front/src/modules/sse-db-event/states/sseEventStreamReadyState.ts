import { createState } from 'twenty-ui/utilities';

export const sseEventStreamReadyState = createState<boolean>({
  key: 'sseEventStreamReadyState',
  defaultValue: false,
});
