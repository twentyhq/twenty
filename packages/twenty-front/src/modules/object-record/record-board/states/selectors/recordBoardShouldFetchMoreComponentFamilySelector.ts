import { recordBoardColumnIdsComponentState } from '@/object-record/record-board/states/recordBoardColumnIdsComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const recordBoardShouldFetchMoreComponentSelector =
  createComponentReadOnlySelector<boolean>({
    key: 'recordBoardShouldFetchMoreComponentSelector',
    get:
      ({ scopeId }: { scopeId: string }) =>
      ({ get }) => {
        const columnIds = get(
          recordBoardColumnIdsComponentState({
            scopeId,
          }),
        );

        const shouldFetchMoreInColumns = columnIds.map((columnId) => {
          return get(
            recordBoardShouldFetchMoreInColumnComponentFamilyState({
              scopeId,
              familyKey: columnId,
            }),
          );
        });

        return shouldFetchMoreInColumns.some(Boolean);
      },
  });
