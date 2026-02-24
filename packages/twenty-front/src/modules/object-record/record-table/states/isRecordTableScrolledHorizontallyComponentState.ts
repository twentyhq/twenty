import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isRecordTableScrolledHorizontallyComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordTableScrolledHorizontallyComponentState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
