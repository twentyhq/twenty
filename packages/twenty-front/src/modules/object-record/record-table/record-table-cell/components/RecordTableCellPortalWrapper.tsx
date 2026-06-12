import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellPortalContexts } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalContexts';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortalWrapper = ({
  position,
  children,
}: {
  position: TableCellPosition;
  children: React.ReactNode;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const cellId = getRecordTableCellId(
    recordTableId,
    position.column,
    position.row,
  );

  const tableCellAnchorElement = document.body.querySelector<HTMLAnchorElement>(
    `#${cellId}`,
  );

  if (!isDefined(tableCellAnchorElement)) {
    return null;
  }

  return (
    <>
      {createPortal(
        <RecordTableCellPortalContexts position={position}>
          {children}
        </RecordTableCellPortalContexts>,
        tableCellAnchorElement,
      )}
    </>
  );
};
