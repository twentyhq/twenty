import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const resizeFieldOffsetComponentState = createComponentStateV2<number>({
  key: 'resizeFieldOffsetComponentState',
  defaultValue: 0,
  componentInstanceContext: RecordTableScopeInternalContext,
});
