import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const focusedRecordTableRowIndexComponentState = createComponentState<
  number | null
>({
  key: 'focusedRecordTableRowIndexComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
