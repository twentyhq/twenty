import { createState } from 'twenty-ui/utilities';
export const navigateBackToViewOnSaveState = createState<boolean>({
  key: 'navigateBackToViewOnSaveState',
  defaultValue: false,
});
