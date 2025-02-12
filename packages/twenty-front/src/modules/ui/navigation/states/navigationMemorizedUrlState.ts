import { createState } from '@ui/utilities/state/utils/createState';

export const navigationMemorizedUrlState = createState<string>({
  key: 'navigationMemorizedUrlState',
  defaultValue: '/',
});
