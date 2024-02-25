import { isFirstRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isFirstRecordBoardColumnFamilyStateScopeMap';
import { isLastRecordBoardColumnFamilyStateScopeMap } from '@/object-record/record-board/states/isLastRecordBoardColumnFamilyStateScopeMap';
import { recordBoardColumnIdsStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnIdsStateScopeMap';
import { recordBoardColumnsFamilyStateScopeMap } from '@/object-record/record-board/states/recordBoardColumnsFamilyStateScopeMap';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { createFamilySelectorScopeMap } from '@/ui/utilities/recoil-scope/utils/createFamilySelectorScopeMap';
import { guardRecoilDefaultValue } from '@/ui/utilities/recoil-scope/utils/guardRecoilDefaultValue';
import { assertNotNull } from '~/utils/assert';

export const recordBoardColumnsFamilySelectorScopeMap =
  createFamilySelectorScopeMap<RecordBoardColumnDefinition | undefined, string>(
    {
      key: 'recordBoardColumnsFamilySelectorScopeMap',
      get:
        ({
          scopeId,
          familyKey: columnId,
        }: {
          scopeId: string;
          familyKey: string;
        }) =>
        ({ get }) => {
          return get(
            recordBoardColumnsFamilyStateScopeMap({
              scopeId,
              familyKey: columnId,
            }),
          );
        },
      set:
        ({
          scopeId,
          familyKey: columnId,
        }: {
          scopeId: string;
          familyKey: string;
        }) =>
        ({ set, get }, newColumn) => {
          set(
            recordBoardColumnsFamilyStateScopeMap({
              scopeId,
              familyKey: columnId,
            }),
            newColumn,
          );

          if (guardRecoilDefaultValue(newColumn)) return;

          const columnIds = get(recordBoardColumnIdsStateScopeMap({ scopeId }));

          const columns = columnIds
            .map((columnId) => {
              return get(
                recordBoardColumnsFamilyStateScopeMap({
                  scopeId,
                  familyKey: columnId,
                }),
              );
            })
            .filter(assertNotNull);

          const lastColumn = [...columns].sort(
            (a, b) => b.position - a.position,
          )[0];

          const firstColumn = [...columns].sort(
            (a, b) => a.position - b.position,
          )[0];

          if (!newColumn) {
            return;
          }

          if (!lastColumn || newColumn.position > lastColumn.position) {
            set(
              isLastRecordBoardColumnFamilyStateScopeMap({
                scopeId,
                familyKey: columnId,
              }),
              true,
            );

            if (lastColumn) {
              set(
                isLastRecordBoardColumnFamilyStateScopeMap({
                  scopeId,
                  familyKey: lastColumn.id,
                }),
                false,
              );
            }
          }

          if (!firstColumn || newColumn.position < firstColumn.position) {
            set(
              isFirstRecordBoardColumnFamilyStateScopeMap({
                scopeId,
                familyKey: columnId,
              }),
              true,
            );

            if (firstColumn) {
              set(
                isFirstRecordBoardColumnFamilyStateScopeMap({
                  scopeId,
                  familyKey: firstColumn.id,
                }),
                false,
              );
            }
          }
        },
    },
  );
