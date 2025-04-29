import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const activeRecordTableRowIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'activeRecordTableRowIdComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
