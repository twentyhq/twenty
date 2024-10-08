import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2_alpha } from '@/ui/utilities/state/component-state/utils/createComponentStateV2_alpha';

export const hasRecordTableFetchedAllRecordsComponentStateV2 =
  createComponentStateV2_alpha<boolean>({
    key: 'hasRecordTableFetchedAllRecordsComponentStateV2',
    componentContext: RecordTableScopeInternalContext,
    defaultValue: false,
  });
