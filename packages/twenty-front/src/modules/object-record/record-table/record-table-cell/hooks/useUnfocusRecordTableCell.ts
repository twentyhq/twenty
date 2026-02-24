import { useCallback } from 'react';

import { getRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/utils/getRecordTableCellFocusId';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useStore } from 'jotai';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { isDefined } from 'twenty-shared/utils';
import { useSetIsRecordTableCellFocusActive } from './useSetIsRecordTableCellFocusActive';

export const useUnfocusRecordTableCell = (recordTableId?: string) => {
  const recordTableIdFromProps = useAvailableComponentInstanceIdOrThrow(
    RecordTableComponentInstanceContext,
    recordTableId,
  );

  const store = useStore();
  const focusPosition = useRecoilComponentStateCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableIdFromProps,
  );

  const { setIsRecordTableCellFocusActive } =
    useSetIsRecordTableCellFocusActive(recordTableIdFromProps);

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const unfocusRecordTableCell = useCallback(() => {
    const currentPosition = store.get(focusPosition);

    if (!isDefined(currentPosition)) {
      return;
    }

    const currentCellFocusId = getRecordTableCellFocusId({
      recordTableId: recordTableIdFromProps,
      cellPosition: currentPosition,
    });

    removeFocusItemFromFocusStackById({
      focusId: currentCellFocusId,
    });

    setIsRecordTableCellFocusActive({
      isRecordTableFocusActive: false,
      cellPosition: currentPosition,
    });
  }, [
    store,
    focusPosition,
    recordTableIdFromProps,
    removeFocusItemFromFocusStackById,
    setIsRecordTableCellFocusActive,
  ]);

  return { unfocusRecordTableCell };
};
