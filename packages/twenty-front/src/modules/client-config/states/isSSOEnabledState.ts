import { createState } from 'twenty-ui';

export const isSSOEnabledState = createState<boolean>({
  key: 'isSSOEnabledState',
  defaultValue: false,
});
