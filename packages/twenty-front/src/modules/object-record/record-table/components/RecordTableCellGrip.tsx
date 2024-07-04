import { useContext } from 'react';

import { GripCell } from '@/object-record/record-table/components/GripCell';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';

export const RecordTableCellGrip = () => {
  const { dragHandleProps, isDragging } = useContext(RecordTableRowContext);

  return (
    <td
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...dragHandleProps}
      data-select-disable
      // isDragging={isDragging}
    >
      <GripCell isDragging={isDragging} />
    </td>
  );
};
