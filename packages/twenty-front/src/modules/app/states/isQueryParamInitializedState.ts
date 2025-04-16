import { createState } from 'twenty-ui/utilities';

export const isQueryParamInitializedState = createState<boolean>({
  key: 'isQueryParamInitializedState',
  defaultValue: false,
});
