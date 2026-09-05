import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const shareRecordModalTargetState =
  createAtomState<ShareRecordModalTarget | null>({
    key: 'shareRecordModalTargetState',
    defaultValue: null,
  });
