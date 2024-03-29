import { createState } from 'twenty-ui';

import { ActionBarEntry } from '../types/ActionBarEntry';

export const actionBarEntriesState = createState<ActionBarEntry[]>({
  key: 'actionBarEntriesState',
  defaultValue: [],
});
