import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { tableAllRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/tableAllRowIdsComponentSelector';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const selectedRowIdsComponentSelector = createComponentSelectorV2<
  string[]
>({
  key: 'selectedRowIdsComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const rowIds = get(
        tableAllRowIdsComponentSelector.selectorFamily({
          instanceId,
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
