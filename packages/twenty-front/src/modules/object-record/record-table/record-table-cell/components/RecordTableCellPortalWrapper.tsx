import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellPortalContexts } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalContexts';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import { recordTableColumnIndexesRenderedOutsideRangeComponentSelector } from '@/object-record/record-table/virtualization/states/recordTableColumnIndexesRenderedOutsideRangeComponentSelector';
import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLayoutEffect, useState } from 'react';
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

  const allRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
  );

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

  const recordId = allRecordIds[position.row];

  const tableCellId =
    isColumnRendered && isDefined(recordId)
      ? getRecordTableCellId(recordTableId, position.column, recordId)
      : null;

  const anchorElementInDocument = isDefined(tableCellId)
    ? document.getElementById(tableCellId)
    : null;

  const [anchorElementMountedLater, setAnchorElementMountedLater] = useState<{
    tableCellId: string;
    element: HTMLElement;
  } | null>(null);

  // The cell can mount in the same commit as the portal, after this render
  useLayoutEffect(() => {
    if (!isDefined(tableCellId) || isDefined(anchorElementInDocument)) {
      return;
    }

    const element = document.getElementById(tableCellId);

    setAnchorElementMountedLater(
      isDefined(element) ? { tableCellId, element } : null,
    );
  }, [tableCellId, anchorElementInDocument]);

  const tableCellAnchorElement =
    anchorElementInDocument ??
    (anchorElementMountedLater?.tableCellId === tableCellId
      ? anchorElementMountedLater.element
      : null);

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
