import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { getRecordIndexId } from '@/command-menu-item/edit/utils/getRecordIndexId';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { ViewType } from '@/views/types/ViewType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSelectFirstRecordForEditMode = () => {
  const store = useStore();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const selectFirstRecordForEditMode = useCallback(() => {
    const recordIndexId = getRecordIndexId(store);

    if (!isDefined(recordIndexId)) {
      return;
    }

    resetRecordIndexSelection();

    const allRecordIds = store.get(
      recordIndexAllRecordIdsComponentSelector.selectorFamily({
        instanceId: recordIndexId,
      }),
    );

    const firstRecordId = allRecordIds[0];

    if (!isDefined(firstRecordId)) {
      return;
    }

    const viewType = store.get(recordIndexViewTypeState.atom);

    switch (viewType) {
      case ViewType.TABLE: {
        store.set(
          isRowSelectedComponentFamilyState.atomFamily({
            instanceId: recordIndexId,
            familyKey: firstRecordId,
          }),
          true,
        );
        break;
      }
      case ViewType.KANBAN: {
        store.set(
          isRecordBoardCardSelectedComponentFamilyState.atomFamily({
            instanceId: recordIndexId,
            familyKey: firstRecordId,
          }),
          true,
        );
        break;
      }
    }
  }, [store, resetRecordIndexSelection]);

  return { selectFirstRecordForEditMode };
};
