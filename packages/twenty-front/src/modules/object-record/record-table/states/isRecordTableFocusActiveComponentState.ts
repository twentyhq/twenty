import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isRecordTableFocusActiveComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordTableFocusActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
