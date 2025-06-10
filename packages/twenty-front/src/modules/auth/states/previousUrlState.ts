import { createState } from 'twenty-ui/utilities';
export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
