import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemIdToRenameState = createAtomState<string | null>(
  {
    key: 'navigationMenuItemIdToRenameState',
    defaultValue: null,
  },
);
