import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Keyed by target record id so each record's timeline keeps its own selection.
// An empty selection means no filter rather than nothing to show.
export const timelineActivityTypeIdsFilterFamilyState = createAtomFamilyState<
  string[],
  string
>({
  key: 'activities/timelineActivityTypeIdsFilterFamilyState',
  defaultValue: [],
});
