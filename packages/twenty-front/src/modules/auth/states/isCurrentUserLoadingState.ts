import { createState } from 'twenty-ui';

export const isCurrentUserLoadedState = createState<boolean>({
  key: 'isCurrentUserLoadedState',
  defaultValue: false,
});
