import { isRecordBoardCardSelectedFamilyStateScopeMap } from '@/object-record/record-board/states/isRecordBoardCardSelectedFamilyStateScopeMap';
import { recordBoardColumnIdsStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnIdsStateScopeMap';
import { recordBoardRecordIdsByColumnIdFamilyStateScopeMap } from '@/object-record/record-board/states/recordBoardRecordIdsByColumnIdFamilyStateScopeMap';
import { createSelectorReadOnlyScopeMap } from '@/ui/utilities/recoil-scope/utils/createSelectorReadOnlyScopeMap';

export const recordBoardSelectedRecordIdsSelectorScopeMap =
  createSelectorReadOnlyScopeMap<string[]>({
    key: 'recordBoardSelectedRecordIdsSelectorScopeMap',
    get:
      ({ scopeId }) =>
      ({ get }) => {
        const columnIds = get(recordBoardColumnIdsStateScopeMap({ scopeId }));

        const recordIdsByColumn = columnIds.map((columnId) =>
          get(
            recordBoardRecordIdsByColumnIdFamilyStateScopeMap({
              scopeId,
              familyKey: columnId,
            }),
          ),
        );

        const recordIds = recordIdsByColumn.flat();

        return recordIds.filter(
          (recordId) =>
            get(
              isRecordBoardCardSelectedFamilyStateScopeMap({
                scopeId,
                familyKey: recordId,
              }),
            ) === true,
        );
      },
  });
