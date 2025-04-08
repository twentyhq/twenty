import { createState } from 'twenty-ui/utilities';
export const currentPageLocationState = createState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
