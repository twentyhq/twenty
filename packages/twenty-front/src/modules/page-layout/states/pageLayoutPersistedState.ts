import { createState } from 'twenty-ui/utilities';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

export const pageLayoutPersistedState = createState<
  PageLayoutWithData | undefined
>({
  key: 'pageLayoutPersistedState',
  defaultValue: undefined,
});
