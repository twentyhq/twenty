import { createState } from 'twenty-ui/utilities';
import { type PageLayoutWidget } from './savedPageLayoutsState';

export const pageLayoutWidgetsState = createState<PageLayoutWidget[]>({
  key: 'pageLayoutWidgetsState',
  defaultValue: [],
});
