import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { RecordTableCellHotkeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHotkeysEffect';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableCellEditModePortal = () => {
  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const recordTableCellEditModePosition = useAtomComponentStateValue(
    recordTableCellEditModePositionComponentState,
  );

  const cellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  if (!isDefined(recordTableFocusPosition) || !isDefined(cellFocusId)) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={recordTableFocusPosition}>
      {recordTableCellEditModePosition && (
        <RecordTableCellPortalRootContainer
          zIndex={TABLE_Z_INDEX.cell.editMode}
        >
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        </RecordTableCellPortalRootContainer>
      )}
      <RecordTableCellHotkeysEffect cellFocusId={cellFocusId} />
    </RecordTableCellPortalWrapper>
  );
};
