import { useRecoilCallback } from 'recoil';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { lastSelectedRowIndexComponentState } from '@/object-record/record-table/record-table-row/states/lastSelectedRowIndexComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useSetCurrentRowSelected = () => {
  const { recordId, rowIndex } = useRecordTableRowContextOrThrow();

  const isRowSelectedFamilyState = useRecoilComponentFamilyStateCallbackStateV2(
    isRowSelectedComponentFamilyState,
  );

  const recordIndexAllRecordIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
  );

  const lastSelectedRowIndexComponentCallbackState =
    useRecoilComponentCallbackState(lastSelectedRowIndexComponentState);

  const store = useStore();

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        newSelectedState,
        shouldSelectRange = false,
      }: {
        newSelectedState: boolean;
        shouldSelectRange?: boolean;
      }) => {
        const allRecordIds = store.get(recordIndexAllRecordIdsAtom);

        const isCurrentRowSelected = store.get(
          isRowSelectedFamilyState(recordId),
        );

        const lastSelectedIndex = snapshot
          .getLoadable(lastSelectedRowIndexComponentCallbackState)
          .getValue();

        if (shouldSelectRange && isDefined(lastSelectedIndex)) {
          const startIndex = Math.min(lastSelectedIndex, rowIndex);
          const endIndex = Math.max(lastSelectedIndex, rowIndex);

          const shouldSelect = !isCurrentRowSelected;

          for (let i = startIndex; i <= endIndex; i++) {
            store.set(isRowSelectedFamilyState(allRecordIds[i]), shouldSelect);
          }

          set(lastSelectedRowIndexComponentCallbackState, rowIndex);
          return;
        }

        if (isCurrentRowSelected !== newSelectedState) {
          store.set(isRowSelectedFamilyState(recordId), newSelectedState);

          set(
            lastSelectedRowIndexComponentCallbackState,
            newSelectedState ? rowIndex : null,
          );
        }
      },
    [
      recordIndexAllRecordIdsAtom,
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
