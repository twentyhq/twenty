import { createState } from 'twenty-ui/utilities';
import { type SavedPageLayout } from './savedPageLayoutsState';

export const pageLayoutPersistedState = createState<
  SavedPageLayout | undefined
>({
  key: 'pageLayoutPersistedState',
  defaultValue: undefined,
});
