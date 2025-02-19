import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableFiltersComponentState = createComponentStateV2<
  RecordFilter[]
>({
  key: 'tableFiltersComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
