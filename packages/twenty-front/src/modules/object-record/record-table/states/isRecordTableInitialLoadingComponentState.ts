import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isRecordTableInitialLoadingComponentState =
  createComponentState<boolean>({
    key: 'isRecordTableInitialLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
