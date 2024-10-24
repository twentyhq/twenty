import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2_alpha } from '@/ui/utilities/state/component-state/utils/createComponentStateV2Alpha';

export const isRecordTableScrolledLeftComponentState =
  createComponentStateV2_alpha<boolean>({
    key: 'isRecordTableScrolledLeftComponentState',
    componentContext: RecordTableScopeInternalContext,
    defaultValue: true,
  });
