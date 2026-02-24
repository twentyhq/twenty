import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const activeRecordTableRowIndexComponentState = createComponentStateV2<
  number | null
>({
  key: 'activeRecordTableRowIndexComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
