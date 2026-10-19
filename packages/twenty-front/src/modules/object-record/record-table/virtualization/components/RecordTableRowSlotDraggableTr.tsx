import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';
import { recordTableRowIndexOfRecordComponentFamilySelector } from '@/object-record/record-table/states/selectors/recordTableRowIndexOfRecordComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';

type RecordTableRowSlotDraggableTrProps = {
  recordId: string;
  children: ReactNode;
};

export const RecordTableRowSlotDraggableTr = ({
  recordId,
  children,
}: RecordTableRowSlotDraggableTrProps) => {
  const rowIndex = useAtomComponentFamilySelectorValue(
    recordTableRowIndexOfRecordComponentFamilySelector,
    recordId,
  );

  if (!isDefined(rowIndex)) {
    return null;
  }

  return (
    <RecordTableDraggableTr recordId={recordId} draggableIndex={rowIndex}>
      {children}
    </RecordTableDraggableTr>
  );
};
