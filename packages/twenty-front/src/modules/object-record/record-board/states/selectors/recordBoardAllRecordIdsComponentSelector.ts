import { recordBoardColumnIdsComponentState } from '@/object-record/record-board/states/recordBoardColumnIdsComponentState';
import { recordBoardRecordIdsByColumnIdComponentFamilyState } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdComponentFamilyState';
import { createComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/createComponentReadOnlySelector';

export const recordBoardAllRecordIdsComponentSelector =
  createComponentReadOnlySelector<string[]>({
    key: 'recordBoardAllRecordIdsComponentSelector',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columnIds = get(recordBoardColumnIdsComponentState({ scopeId }));

        const recordIdsByColumn = columnIds.map((columnId) =>
          get(
            recordBoardRecordIdsByColumnIdComponentFamilyState({
              scopeId,
              familyKey: columnId,
            }),
          ),
        );

        const recordIds = recordIdsByColumn.flat();

        return recordIds;
      },
  });
