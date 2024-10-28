import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const numberOfTableColumnsComponentSelector = createComponentSelectorV2({
  key: 'numberOfTableColumnsComponentSelector',
  componentInstanceContext: RecordTableScopeInternalContext,
  get:
    ({ instanceId }) =>
    ({ get }) =>
      get(tableColumnsComponentState.atomFamily({ instanceId })).length,
});
