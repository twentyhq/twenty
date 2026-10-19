import { useStore } from 'jotai';
import { useLayoutEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { RecordTableRowSlotRecordContent } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotRecordContent';
import { StyledRowSlotPosition } from '@/object-record/record-table/virtualization/components/RecordTableRowSlotPosition';
import { getRowSlotTop } from '@/object-record/record-table/virtualization/utils/getRowSlotTop';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';

type RecordTableRowSlotRecordProps = {
  recordId: string;
};

// The row index is written to the DOM directly so a shift never re-renders the row
export const RecordTableRowSlotRecord = ({
  recordId,
}: RecordTableRowSlotRecordProps) => {
  const store = useStore();
  const rowSlotElementRef = useRef<HTMLDivElement>(null);

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
  }, [recordId, rowIndexOfRecordCallbackState, store]);

  return (
    <StyledRowSlotPosition
      ref={rowSlotElementRef}
      data-replay-ignore-mutations="true"
    >
      <RecordTableRowSlotRecordContent recordId={recordId} />
    </StyledRowSlotPosition>
  );
};
