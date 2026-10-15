import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellPortalContexts } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalContexts';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { recordTableColumnIndexesRenderedOutsideRangeComponentSelector } from '@/object-record/record-table/virtualization/states/recordTableColumnIndexesRenderedOutsideRangeComponentSelector';
import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const recordTableRenderedColumnRange = useAtomComponentStateValue(
    recordTableRenderedColumnRangeComponentState,
  );

  const recordTableColumnIndexesRenderedOutsideRange =
    useAtomComponentSelectorValue(
      recordTableColumnIndexesRenderedOutsideRangeComponentSelector,
    );

  const isColumnRendered = isRecordTableColumnRendered({
    columnIndex: position.column,
    renderedColumnRange: recordTableRenderedColumnRange,
    columnIndexesRenderedOutsideRange:
      recordTableColumnIndexesRenderedOutsideRange,
  });

  const tableCellAnchorElement = isColumnRendered
    ? document.body.querySelector<HTMLAnchorElement>(
        `#${getRecordTableCellId(recordTableId, position.column, position.row)}`,
      )
    : null;

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
