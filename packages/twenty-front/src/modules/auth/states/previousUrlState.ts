import { createState } from '@ui/utilities/state/utils/createState';

export const previousUrlState = createState<string>({
  key: 'previousUrlState',
  defaultValue: '',
});
