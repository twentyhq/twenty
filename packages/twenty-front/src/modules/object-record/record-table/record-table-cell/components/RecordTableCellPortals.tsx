import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellArrowKeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellArrowKeysEffect';
import { RecordTableCellEditModePortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditModePortal';
import { RecordTableCellFocusedPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortal';
import { RecordTableCellHoveredPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHoveredPortal';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortals = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableFocusActive = useRecoilComponentValue(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const recordTableCellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  return (
    <>
      <RecordTableCellHoveredPortal />
      <RecordTableCellFocusedPortal />
      {isRecordTableFocusActive && (
        <>
          <RecordTableCellEditModePortal />
          {isDefined(recordTableCellFocusId) && (
            <RecordTableCellArrowKeysEffect
              cellFocusId={recordTableCellFocusId}
            />
          )}
        </>
      )}
    </>
  );
};
