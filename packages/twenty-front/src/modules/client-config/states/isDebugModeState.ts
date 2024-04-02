import { createState } from 'twenty-ui';

export const isDebugModeState = createState<boolean>({
  key: 'isDebugModeState',
  defaultValue: false,
});
