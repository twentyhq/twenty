import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellArrowKeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellArrowKeysEffect';
import { RecordTableCellEditModePortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditModePortal';
import { RecordTableCellFocusedPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortal';
import { RecordTableCellHoveredPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortal';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordTableCellPortals = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableFocusActive = useRecoilComponentValue(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  return (
    <>
      <RecordTableCellHoveredPortal />
      <RecordTableCellFocusedPortal />
      {isRecordTableFocusActive && (
        <>
          <RecordTableCellEditModePortal />
          <RecordTableCellArrowKeysEffect />
        </>
      )}
    </>
  );
};
