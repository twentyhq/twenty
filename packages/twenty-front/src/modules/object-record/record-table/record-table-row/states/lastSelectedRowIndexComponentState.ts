import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const lastSelectedRowIndexComponentState = createComponentState<
  number | null | undefined
>({
  key: 'record-table/last-selected-row-index',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
