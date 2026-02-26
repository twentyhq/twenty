import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const viewableRecordIdState = createAtomState<string | null>({
  key: 'activities/viewable-record-id',
  defaultValue: null,
});
