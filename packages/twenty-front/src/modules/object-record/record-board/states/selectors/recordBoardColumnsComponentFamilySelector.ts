import { isUndefined } from '@sniptt/guards';

import { isFirstRecordBoardColumnComponentFamilyState } from '@/object-record/record-board/states/isFirstRecordBoardColumnComponentFamilyState';
import { isLastRecordBoardColumnComponentFamilyState } from '@/object-record/record-board/states/isLastRecordBoardColumnComponentFamilyState';
import { recordBoardColumnIdsComponentState } from '@/object-record/record-board/states/recordBoardColumnIdsComponentState';
import { recordBoardColumnsComponentFamilyState } from '@/object-record/record-board/states/recordBoardColumnsComponentFamilyState';
import { RecordBoardColumnDefinition } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { guardRecoilDefaultValue } from '@/ui/utilities/recoil-scope/utils/guardRecoilDefaultValue';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { isDefined } from '~/utils/isDefined';

export const recordBoardColumnsComponentFamilySelector =
  createComponentFamilySelector<
    RecordBoardColumnDefinition | undefined,
    string
  >({
    key: 'recordBoardColumnsComponentFamilySelector',
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
          recordBoardColumnsComponentFamilyState({
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
          recordBoardColumnsComponentFamilyState({
            scopeId,
            familyKey: columnId,
          }),
          newColumn,
        );

        if (guardRecoilDefaultValue(newColumn)) return;

        const columnIds = get(recordBoardColumnIdsComponentState({ scopeId }));

        const columns = columnIds
          .map((columnId) => {
            return get(
              recordBoardColumnsComponentFamilyState({
                scopeId,
                familyKey: columnId,
              }),
            );
          })
          .filter(isDefined);

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
            isLastRecordBoardColumnComponentFamilyState({
              scopeId,
              familyKey: columnId,
            }),
            true,
          );

          if (!isUndefined(lastColumn)) {
            set(
              isLastRecordBoardColumnComponentFamilyState({
                scopeId,
                familyKey: lastColumn.id,
              }),
              false,
            );
          }
        }

        if (!firstColumn || newColumn.position < firstColumn.position) {
          set(
            isFirstRecordBoardColumnComponentFamilyState({
              scopeId,
              familyKey: columnId,
            }),
            true,
          );

          if (!isUndefined(firstColumn)) {
            set(
              isFirstRecordBoardColumnComponentFamilyState({
                scopeId,
                familyKey: firstColumn.id,
              }),
              false,
            );
          }
        }
      },
  });
