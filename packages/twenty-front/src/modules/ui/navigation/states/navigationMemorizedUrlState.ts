import { createState } from 'twenty-ui';

export const navigationMemorizedUrlState = createState<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
