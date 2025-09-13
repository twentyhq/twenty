import { createState } from 'twenty-ui/utilities';

export const mergeInProgressState = createState<boolean>({
  key: 'mergeInProgressState',
  defaultValue: false,
});
