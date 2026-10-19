import { memo } from 'react';

import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { RecordTableRowCells } from '@/object-record/record-table/record-table-row/components/RecordTableRowCells';
import { RecordTableStaticTr } from '@/object-record/record-table/record-table-row/components/RecordTableStaticTr';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type RecordTableRowProps = {
  recordId: string;
};

// The group list re-renders on every insert or removal; rows only depend on their record
export const RecordTableRow = memo(({ recordId }: RecordTableRowProps) => {
  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  if (isRecordTableDragColumnHidden) {
    return (
      <RecordTableStaticTr recordId={recordId}>
        <RecordTableRowCells />
      </RecordTableStaticTr>
    );
  }

  return (
    <RecordTableDraggableTr recordId={recordId}>
      <RecordTableRowCells />
    </RecordTableDraggableTr>
  );
});
