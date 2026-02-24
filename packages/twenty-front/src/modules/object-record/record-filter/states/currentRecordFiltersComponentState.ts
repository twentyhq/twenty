import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const currentRecordFiltersComponentState = createComponentState<
  RecordFilter[]
>({
  key: 'currentRecordFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFiltersComponentInstanceContext,
});
