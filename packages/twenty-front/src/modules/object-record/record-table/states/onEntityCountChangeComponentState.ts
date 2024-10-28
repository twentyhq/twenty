import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const onEntityCountChangeComponentState = createComponentStateV2<
  ((entityCount?: number) => void) | undefined
>({
  key: 'onEntityCountChangeComponentState',
  defaultValue: undefined,
  componentInstanceContext: RecordTableScopeInternalContext,
});
