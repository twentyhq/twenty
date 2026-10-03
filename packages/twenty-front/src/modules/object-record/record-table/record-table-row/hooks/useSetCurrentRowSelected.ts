import { useCallback } from 'react';
import { useStore } from 'jotai';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { lastSelectedRecordIndexComponentState } from '@/object-record/record-selection/states/lastSelectedRecordIndexComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { isDefined } from 'twenty-shared/utils';

export const useSetCurrentRowSelected = () => {
  const { recordId, rowIndex } = useRecordTableRowContextOrThrow();

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRecordSelectedComponentFamilyState,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorCallbackState(
    recordIndexAllRecordIdsComponentSelector,
  );

  const lastSelectedRowIndexComponentCallbackState =
    useAtomComponentStateCallbackState(lastSelectedRecordIndexComponentState);

  const store = useStore();

  const setCurrentRowSelected = useCallback(
    ({
      newSelectedState,
      shouldSelectRange = false,
    }: {
      newSelectedState: boolean;
      shouldSelectRange?: boolean;
    }) => {
      const allRecordIds = store.get(recordIndexAllRecordIds);

      const isCurrentRowSelected = store.get(
        isRowSelectedFamilyState(recordId),
      );

      const lastSelectedIndex = store.get(
        lastSelectedRowIndexComponentCallbackState,
      );

      if (shouldSelectRange && isDefined(lastSelectedIndex)) {
        const startIndex = Math.min(lastSelectedIndex, rowIndex);
        const endIndex = Math.max(lastSelectedIndex, rowIndex);

        const shouldSelect = !isCurrentRowSelected;

        for (let i = startIndex; i <= endIndex; i++) {
          store.set(isRowSelectedFamilyState(allRecordIds[i]), shouldSelect);
        }

        store.set(lastSelectedRowIndexComponentCallbackState, rowIndex);
        return;
      }

      if (isCurrentRowSelected !== newSelectedState) {
        store.set(isRowSelectedFamilyState(recordId), newSelectedState);

        store.set(
          lastSelectedRowIndexComponentCallbackState,
          newSelectedState ? rowIndex : null,
        );
      }
    },
    [
      recordIndexAllRecordIds,
      isRowSelectedFamilyState,
      recordId,
      lastSelectedRowIndexComponentCallbackState,
      rowIndex,
      store,
    ],
  );

  return {
    setCurrentRowSelected,
  };
};
