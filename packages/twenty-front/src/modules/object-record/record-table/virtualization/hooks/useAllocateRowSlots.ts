import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { ROW_SLOTS } from '@/object-record/record-table/virtualization/constants/RowSlots';
import { lastScrollPositionComponentState } from '@/object-record/record-table/virtualization/states/lastScrollPositionComponentState';
import { rowSlotBindingComponentFamilyState } from '@/object-record/record-table/virtualization/states/rowSlotBindingComponentFamilyState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { computeRowSlotBindings } from '@/object-record/record-table/virtualization/utils/computeRowSlotBindings';
import { getRowSlotWindow } from '@/object-record/record-table/virtualization/utils/getRowSlotWindow';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

export const useAllocateRowSlots = () => {
  const store = useStore();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const rowSlotBindingCallbackState = useAtomComponentFamilyStateCallbackState(
    rowSlotBindingComponentFamilyState,
  );

  const recordIdsByGroupCallbackState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
    );

  const totalNumberOfRowsCallbackState = useAtomComponentStateCallbackState(
    totalNumberOfRowsComponentState,
  );

  const lastScrollPositionCallbackState = useAtomComponentStateCallbackState(
    lastScrollPositionComponentState,
  );

  const allocateRowSlots = useCallback(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    const { firstRowIndex, lastRowIndex } = getRowSlotWindow({
      scrollTop: store.get(lastScrollPositionCallbackState),
      viewportHeight: scrollWrapperElement?.clientHeight ?? 0,
      totalNumberOfRows: store.get(totalNumberOfRowsCallbackState) ?? 0,
    });

    const currentBindings = ROW_SLOTS.map((rowSlot) =>
      store.get(rowSlotBindingCallbackState(rowSlot)),
    );

    const nextBindings = computeRowSlotBindings({
      currentBindings,
      recordIdsByRowIndex: store.get(
        recordIdsByGroupCallbackState(NO_RECORD_GROUP_FAMILY_KEY),
      ),
      firstRowIndex,
      lastRowIndex,
    });

    for (const rowSlot of ROW_SLOTS) {
      if (nextBindings[rowSlot] !== currentBindings[rowSlot]) {
        store.set(rowSlotBindingCallbackState(rowSlot), nextBindings[rowSlot]);
      }
    }
  }, [
    getScrollWrapperElement,
    lastScrollPositionCallbackState,
    recordIdsByGroupCallbackState,
    rowSlotBindingCallbackState,
    store,
    totalNumberOfRowsCallbackState,
  ]);

  return { allocateRowSlots };
};
