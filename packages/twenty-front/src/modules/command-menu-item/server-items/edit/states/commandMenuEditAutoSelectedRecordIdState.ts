import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const commandMenuEditAutoSelectedRecordIdState =
  createAtomState<string | null>({
    key: 'commandMenuEditAutoSelectedRecordIdState',
    defaultValue: null,
  });
