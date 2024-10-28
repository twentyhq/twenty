import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const recordTablePendingRecordIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'recordTablePendingRecordIdState',
  defaultValue: null,
  componentInstanceContext: RecordTableScopeInternalContext,
});
