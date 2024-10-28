import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isRecordTableScrolledLeftComponentState =
  createComponentStateV2<boolean>({
    key: 'isRecordTableScrolledLeftComponentState',
    componentInstanceContext: RecordTableScopeInternalContext,
    defaultValue: true,
  });
