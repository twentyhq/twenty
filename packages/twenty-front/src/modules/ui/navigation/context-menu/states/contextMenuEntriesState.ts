import { createState } from 'twenty-ui';

import { ContextMenuEntry } from '../types/ContextMenuEntry';

export const contextMenuEntriesState = createState<ContextMenuEntry[]>({
  key: 'contextMenuEntriesState',
  defaultValue: [],
});
