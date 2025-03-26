import { createState } from 'twenty-ui';

export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
