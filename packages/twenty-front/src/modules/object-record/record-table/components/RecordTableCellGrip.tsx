import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { GripCell } from '@/object-record/record-table/components/GripCell';
import { RecordTableTd } from '@/object-record/record-table/components/RecordTableTd';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';

export const RecordTableCellGrip = () => {
  const { dragHandleProps, isDragging } = useContext(RecordTableRowContext);

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
    <RecordTableTd
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      sticky
      left={0}
      zIndex={zIndex}
    >
      <GripCell isDragging={isDragging} />
    </RecordTableTd>
  );
};
