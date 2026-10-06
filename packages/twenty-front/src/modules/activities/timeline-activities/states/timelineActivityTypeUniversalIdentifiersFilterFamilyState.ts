import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// An empty selection means no filter rather than nothing to show.
export const timelineActivityTypeUniversalIdentifiersFilterFamilyState =
  createAtomFamilyState<string[], string>({
    key: 'activities/timelineActivityTypeUniversalIdentifiersFilterFamilyState',
    defaultValue: [],
  });
