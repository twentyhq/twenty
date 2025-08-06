import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordTableScrolledLeftComponentState =
  createComponentState<boolean>({
    key: 'isRecordTableScrolledLeftComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: true,
  });
