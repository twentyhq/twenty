import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isRecordTableInitialLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordTableInitialLoadingComponentState',
    defaultValue: true,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
