import { createState } from 'twenty-ui/utilities';

export const arePrefetchViewsLoadedState = createState<boolean>({
  key: 'arePrefetchViewsLoadedState',
  defaultValue: false,
});
