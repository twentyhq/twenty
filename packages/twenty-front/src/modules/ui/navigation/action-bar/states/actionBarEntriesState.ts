import { createState } from '@/ui/utilities/state/utils/createState';

import { ActionBarEntry } from '../types/ActionBarEntry';

export const actionBarEntriesState = createState<ActionBarEntry[]>({
  key: 'actionBarEntriesState',
  defaultValue: [],
});
