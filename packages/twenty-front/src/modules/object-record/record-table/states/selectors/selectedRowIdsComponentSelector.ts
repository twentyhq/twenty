import { RecordGroupDefinitionId } from '@/object-record/record-group/types/RecordGroupDefinition';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableRowIdsByGroupComponentFamilyState } from '@/object-record/record-table/states/tableRowIdsByGroupComponentFamilyState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelectorV2';

export const selectedRowIdsComponentSelector = createComponentFamilySelectorV2<
  string[],
  RecordGroupDefinitionId
>({
  key: 'selectedRowIdsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId, familyKey }) =>
    ({ get }) => {
      const rowIds = get(
        tableRowIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey,
        }),
      );

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
