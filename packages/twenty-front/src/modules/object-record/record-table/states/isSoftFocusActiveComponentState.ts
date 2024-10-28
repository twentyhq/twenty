import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isSoftFocusActiveComponentState = createComponentStateV2<boolean>({
  key: 'isSoftFocusActiveComponentState',
  defaultValue: false,
  componentInstanceContext: RecordTableScopeInternalContext,
});
