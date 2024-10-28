import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const selectedRowIdsComponentSelector = createComponentSelectorV2<
  string[]
>({
  key: 'selectedRowIdsComponentSelector',
  componentInstanceContext: RecordTableScopeInternalContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const rowIds = get(tableRowIdsComponentState.atomFamily({ instanceId }));

      return rowIds.filter(
        (rowId) =>
          get(
            isRowSelectedComponentFamilyState.atomFamily({
              instanceId,
              familyKey: rowId,
            }),
          ) === true,
      );
    },
});
