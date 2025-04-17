import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellEditModePortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditModePortal';
import { RecordTableCellHoveredPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortal';
import { isFocusActiveComponentState } from '@/object-record/record-table/states/isFocusActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordTableCellPortals = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isFocusActive = useRecoilComponentValueV2(
    isFocusActiveComponentState,
    recordTableId,
  );

  return (
    <>
      <RecordTableCellHoveredPortal />

      {isFocusActive && <RecordTableCellEditModePortal />}
    </>
  );
};
