import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldBlockedByIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldBlockedByIdState',
  defaultValue: null,
});
