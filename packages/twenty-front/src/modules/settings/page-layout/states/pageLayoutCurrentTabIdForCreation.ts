import { createState } from 'twenty-ui/utilities';

export const pageLayoutCurrentTabIdForCreationState = createState<
  string | null
>({
  key: 'pageLayoutCurrentTabIdForCreationState',
  defaultValue: null,
});
