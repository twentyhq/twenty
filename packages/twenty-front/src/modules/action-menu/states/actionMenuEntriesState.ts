import { createState } from 'twenty-ui';

import { ActionMenuEntry } from '../types/ActionMenuEntry';

export const actionMenuEntriesState = createState<ActionMenuEntry[]>({
  key: 'actionMenuEntriesState',
  defaultValue: [],
});
