import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const hasRecordTableFetchedAllRecordsComponentStateV2 =
  createComponentStateV2<boolean>({
    key: 'hasRecordTableFetchedAllRecordsComponentStateV2',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: false,
  });
