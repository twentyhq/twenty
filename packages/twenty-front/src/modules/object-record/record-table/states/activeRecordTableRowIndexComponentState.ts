import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const activeRecordTableRowIndexComponentState = createComponentState<
  number | null
>({
  key: 'activeRecordTableRowIndexComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
