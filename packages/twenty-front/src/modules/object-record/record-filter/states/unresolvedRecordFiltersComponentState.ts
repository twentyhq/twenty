import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Persisted filters whose field no longer exists, kept apart from
// currentRecordFilters since their type and label cannot be derived
export const unresolvedRecordFiltersComponentState = createAtomComponentState<
  PersistedRecordFilter[]
>({
  key: 'unresolvedRecordFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFiltersComponentInstanceContext,
});
