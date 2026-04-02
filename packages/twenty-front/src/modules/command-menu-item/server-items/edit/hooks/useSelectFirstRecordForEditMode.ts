import { commandMenuEditAutoSelectedRecordIdState } from '@/command-menu-item/server-items/edit/states/commandMenuEditAutoSelectedRecordIdState';
import { getRecordIndexId } from '@/command-menu-item/server-items/edit/utils/getRecordIndexId';
import { unselectRecord } from '@/command-menu-item/server-items/edit/utils/unselectRecord';
import { isRecordBoardCardSelectedComponentFamilyState } from '@/object-record/record-board/states/isRecordBoardCardSelectedComponentFamilyState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { ViewType } from '@/views/types/ViewType';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useSelectFirstRecordForEditMode = () => {
  const store = useStore();

  const selectFirstRecordForEditMode = useCallback(() => {
    const recordIndexId = getRecordIndexId(store);

    if (!isDefined(recordIndexId)) {
      return;
    }

    const previousRecordId = store.get(
      commandMenuEditAutoSelectedRecordIdState.atom,
    );

    if (isDefined(previousRecordId)) {
      unselectRecord(store, previousRecordId, recordIndexId);
    }

    const allRecordIds = store.get(
      recordIndexAllRecordIdsComponentSelector.selectorFamily({
        instanceId: recordIndexId,
      }),
    );

    const firstRecordId = allRecordIds[0];

    if (!isDefined(firstRecordId)) {
      store.set(commandMenuEditAutoSelectedRecordIdState.atom, null);

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

    store.set(commandMenuEditAutoSelectedRecordIdState.atom, firstRecordId);
  }, [store]);

  return { selectFirstRecordForEditMode };
};
