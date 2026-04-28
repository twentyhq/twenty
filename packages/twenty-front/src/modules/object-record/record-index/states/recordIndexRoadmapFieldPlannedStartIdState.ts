import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldPlannedStartIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldPlannedStartIdState',
  defaultValue: null,
});
