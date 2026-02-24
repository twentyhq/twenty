import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const currentRecordFiltersComponentState = createComponentStateV2<
  RecordFilter[]
>({
  key: 'currentRecordFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordFiltersComponentInstanceContext,
});
