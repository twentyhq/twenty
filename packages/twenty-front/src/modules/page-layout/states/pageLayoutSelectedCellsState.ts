import { createState } from 'twenty-ui/utilities';

export const pageLayoutSelectedCellsState = createState<Set<string>>({
  key: 'pageLayoutSelectedCellsState',
  defaultValue: new Set(),
});
