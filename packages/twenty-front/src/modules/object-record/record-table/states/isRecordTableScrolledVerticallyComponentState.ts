import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordTableScrolledVerticallyComponentState =
  createComponentState<boolean>({
    key: 'isRecordTableScrolledVerticallyComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
