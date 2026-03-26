import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuItemEditNumberOfSelectedRecordsState =
  createAtomState<number>({
    key: 'commandMenuItemEditNumberOfSelectedRecordsState',
    defaultValue: 0,
  });
