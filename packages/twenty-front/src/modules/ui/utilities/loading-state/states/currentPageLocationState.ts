import { createState } from '@ui/utilities/state/utils/createState';

export const currentPageLocationState = createState<string>({
  key: 'currentPageLocationState',
  defaultValue: '',
});
