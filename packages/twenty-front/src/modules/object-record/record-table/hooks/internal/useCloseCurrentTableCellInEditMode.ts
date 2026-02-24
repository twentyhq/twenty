import { useStore } from 'jotai';
import { useCallback } from 'react';

import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
import { useRemoveLastFocusItemFromFocusStackByComponentType } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackByComponentType';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';

export const useCloseCurrentTableCellInEditMode = (recordTableId?: string) => {
  const store = useStore();
  const currentTableCellInEditModePositionAtom =
    useRecoilComponentStateCallbackStateV2(
      recordTableCellEditModePositionComponentState,
      recordTableId,
    );

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const { removeLastFocusItemFromFocusStackByComponentType } =
    useRemoveLastFocusItemFromFocusStackByComponentType();

  return useCallback(() => {
    store.set(currentTableCellInEditModePositionAtom, null);

    goBackToPreviousDropdownFocusId();

    removeLastFocusItemFromFocusStackByComponentType({
      componentType: FocusComponentType.OPENED_FIELD_INPUT,
    });
  }, [
    store,
    currentTableCellInEditModePositionAtom,
    goBackToPreviousDropdownFocusId,
    removeLastFocusItemFromFocusStackByComponentType,
  ]);
};
