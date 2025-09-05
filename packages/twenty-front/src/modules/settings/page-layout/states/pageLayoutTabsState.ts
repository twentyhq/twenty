import { createState } from 'twenty-ui/utilities';
import { type PageLayoutTab } from './savedPageLayoutsState';

export const pageLayoutTabsState = createState<PageLayoutTab[]>({
  key: 'pageLayoutTabsState',
  defaultValue: [],
});
