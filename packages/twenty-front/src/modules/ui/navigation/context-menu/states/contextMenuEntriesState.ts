import { createState } from '@/ui/utilities/state/utils/createState';

import { ContextMenuEntry } from '../types/ContextMenuEntry';

export const contextMenuEntriesState = createState<ContextMenuEntry[]>({
  key: 'contextMenuEntriesState',
  defaultValue: [],
});
