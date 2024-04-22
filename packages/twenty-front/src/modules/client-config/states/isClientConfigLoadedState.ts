import { createState } from 'twenty-ui';

export const isClientConfigLoadedState = createState<boolean>({
  key: 'isClientConfigLoadedState',
  defaultValue: false,
});
