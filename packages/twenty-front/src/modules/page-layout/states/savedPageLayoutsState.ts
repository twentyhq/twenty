import { createState } from 'twenty-ui/utilities';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

export const savedPageLayoutsState = createState<PageLayoutWithData[]>({
  key: 'savedPageLayoutsState',
  defaultValue: [],
});
