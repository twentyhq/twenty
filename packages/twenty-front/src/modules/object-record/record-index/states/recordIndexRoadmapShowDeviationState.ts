import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapShowDeviationState = createAtomState<boolean>({
  key: 'recordIndexRoadmapShowDeviationState',
  defaultValue: false,
});
