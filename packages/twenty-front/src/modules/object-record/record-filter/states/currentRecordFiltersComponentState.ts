import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';

export const currentRecordFiltersComponentState = createComponentState<
  RecordFilter[]
>({
  key: 'currentRecordFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFiltersComponentInstanceContext,
});
