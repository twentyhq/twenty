import { createState } from 'twenty-ui/utilities';

export const currentPageLayoutIdState = createState<string | null>({
  key: 'currentPageLayoutIdState',
  defaultValue: null,
});
