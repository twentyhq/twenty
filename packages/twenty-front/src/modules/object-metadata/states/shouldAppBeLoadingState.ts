import { createState } from 'twenty-ui/utilities';
export const shouldAppBeLoadingState = createState<boolean>({
  key: 'shouldAppBeLoadingState',
  defaultValue: false,
});
