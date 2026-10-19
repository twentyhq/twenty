import { useStore } from 'jotai';
import { type RefObject, useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { getRowSlotTop } from '@/object-record/record-table/virtualization/utils/getRowSlotTop';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';

type RecordTableRowSlotPositionEffectProps = {
  recordId: string;
  rowSlotElementRef: RefObject<HTMLDivElement | null>;
};

// The row index is written to the DOM directly so a shift never re-renders the row
export const RecordTableRowSlotPositionEffect = ({
  recordId,
  rowSlotElementRef,
}: RecordTableRowSlotPositionEffectProps) => {
  const store = useStore();

  const rowIndexOfRecordCallbackState =
    useAtomComponentFamilySelectorCallbackState(
      recordTableRowIndexOfRecordComponentFamilySelector,
    );

  useLayoutEffect(() => {
    const rowIndexAtom = rowIndexOfRecordCallbackState(recordId);

    const applyRowIndex = () => {
      const rowSlotElement = rowSlotElementRef.current;
      const rowIndex = store.get(rowIndexAtom);

      if (!isDefined(rowSlotElement)) {
        return;
      }

      rowSlotElement.style.display = isDefined(rowIndex) ? '' : 'none';
      rowSlotElement.style.top = `${getRowSlotTop(rowIndex ?? 0)}px`;
    };

    applyRowIndex();

    return store.sub(rowIndexAtom, applyRowIndex);
  }, [recordId, rowIndexOfRecordCallbackState, rowSlotElementRef, store]);

  return null;
};
