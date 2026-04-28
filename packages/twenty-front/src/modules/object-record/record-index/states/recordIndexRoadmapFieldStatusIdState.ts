import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldStatusIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldStatusIdState',
  defaultValue: null,
});
