import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const unselectedRowIdsComponentSelector =
  createComponentReadOnlySelector<string[]>({
    key: 'unselectedRowIdsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const rowIds = get(tableRowIdsComponentState({ scopeId }));

        return rowIds.filter(
          (rowId) =>
            get(
              isRowSelectedComponentFamilyState({
                scopeId,
                familyKey: rowId,
              }),
            ) === false,
        );
      },
  });
