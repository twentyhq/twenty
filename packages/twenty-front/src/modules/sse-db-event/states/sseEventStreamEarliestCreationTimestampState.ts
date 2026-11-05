import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const sseEventStreamEarliestCreationTimestampState =
  createAtomState<number>({
    key: 'sseEventStreamEarliestCreationTimestampState',
    defaultValue: 0,
  });
