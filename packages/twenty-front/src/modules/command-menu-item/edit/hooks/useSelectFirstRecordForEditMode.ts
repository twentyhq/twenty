import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { getRecordIndexId } from '@/command-menu-item/edit/utils/getRecordIndexId';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
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

    store.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId: recordIndexId,
        familyKey: firstRecordId,
      }),
      true,
    );
  }, [store, resetRecordIndexSelection]);

  return { selectFirstRecordForEditMode };
};
