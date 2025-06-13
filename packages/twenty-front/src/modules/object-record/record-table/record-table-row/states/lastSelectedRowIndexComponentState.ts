import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const lastSelectedRowIndexComponentState = createComponentStateV2<
  number | null | undefined
>({
  key: 'record-table/last-selected-row-index',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
