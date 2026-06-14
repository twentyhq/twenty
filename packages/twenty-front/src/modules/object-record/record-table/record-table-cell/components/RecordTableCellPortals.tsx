import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellArrowKeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellArrowKeysEffect';
import { RecordTableCellEditModePortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditModePortal';
import { RecordTableCellFocusedPortal } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFocusedPortal';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { isRecordTableCellFocusActiveComponentState } from '@/object-record/record-table/states/isRecordTableCellFocusActiveComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellPortals = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const isRecordTableCellFocusActive = useAtomComponentStateValue(
    isRecordTableCellFocusActiveComponentState,
    recordTableId,
  );

  const recordTableCellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  return (
    <>
      <RecordTableCellFocusedPortal />
      {isRecordTableCellFocusActive && (
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
