import { useCallback } from 'react';

import { useUnfocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useUnfocusRecordTableCell';

import { useMoveRecordField } from '@/object-record/record-field/hooks/useMoveRecordField';

type useRecordTableProps = {
  recordTableId: string;
};

export const useMoveTableColumn = ({ recordTableId }: useRecordTableProps) => {
  const { unfocusRecordTableCell } = useUnfocusRecordTableCell(recordTableId);

  const { moveRecordField } = useMoveRecordField(recordTableId);

  const moveTableColumn = useCallback(
    async (direction: 'left' | 'right', fieldMetadataItemId: string) => {
      unfocusRecordTableCell();

      await moveRecordField({
        direction: direction === 'left' ? 'before' : 'after',
        fieldMetadataItemIdToMove: fieldMetadataItemId,
      });
    },
    [unfocusRecordTableCell, moveRecordField],
  );

  return {
    moveTableColumn,
  };
};
