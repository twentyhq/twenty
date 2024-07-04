import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { CheckboxCell } from '@/object-record/record-table/components/CheckboxCell';
import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';

export const RecordTableCellCheckbox = () => {
  const { isSelected, isDragging } = useContext(RecordTableRowContext);

  const isRecordTableScrolledLeft = useRecoilValue(
    isRecordTableScrolledLeftState,
  );
  const isRecordTableScrolledTop = useRecoilValue(
    isRecordTableScrolledTopState,
  );

  const zIndex =
    !isRecordTableScrolledLeft && !isRecordTableScrolledTop
      ? 5
      : !isRecordTableScrolledLeft
        ? 4
        : !isRecordTableScrolledTop
          ? 1
          : 1;

  return (
    <RecordTableTd isSelected={isSelected} sticky left={9} zIndex={zIndex}>
      {!isDragging && <CheckboxCell />}
    </RecordTableTd>
  );
};
