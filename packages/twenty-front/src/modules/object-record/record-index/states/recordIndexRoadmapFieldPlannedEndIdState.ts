import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldPlannedEndIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldPlannedEndIdState',
  defaultValue: null,
});
