import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2_alpha } from '@/ui/utilities/state/component-state/utils/createComponentStateV2_alpha';

export const isRecordTableScrolledTopComponentState =
  createComponentStateV2_alpha<boolean>({
    key: 'isRecordTableScrolledTopComponentState',
    componentContext: RecordTableScopeInternalContext,
    defaultValue: true,
  });
