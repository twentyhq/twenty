import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { RecordTableCellHotkeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHotkeysEffect';
import { RecordTableCellPortalRootContainer } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalRootContainer';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';

export const RecordTableCellEditModePortal = () => {
  const focusedCellPosition = useRecoilComponentValue(
    recordTableFocusPositionComponentState,
  );

  const currentTableCellInEditModePosition = useRecoilComponentValue(
    recordTableCellEditModePositionComponentState,
  );

  if (!focusedCellPosition) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={focusedCellPosition}>
      {currentTableCellInEditModePosition && (
        <RecordTableCellPortalRootContainer
          zIndex={TABLE_Z_INDEX.cell.editMode}
        >
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        </RecordTableCellPortalRootContainer>
      )}
      <RecordTableCellHotkeysEffect />
    </RecordTableCellPortalWrapper>
  );
};
