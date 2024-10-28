import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const onToggleColumnFilterComponentState = createComponentStateV2<
  ((fieldMetadataId: string) => void) | undefined
>({
  key: 'onToggleColumnFilterComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordTableScopeInternalContext,
});
