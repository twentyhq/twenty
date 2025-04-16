import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { RecordTableFocusModeHotkeysSetterEffect } from '@/object-record/record-table/components/RecordTableFocusModeHotkeysSetterEffect';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';

export const RecordTableCellEditModePortal = () => {
  const openedCellPosition = useRecoilComponentValueV2(
    currentTableCellInEditModePositionComponentState,
  );

  if (!openedCellPosition) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={openedCellPosition}>
      <RecordTableCellEditMode>
        <RecordTableCellFieldInput />
      </RecordTableCellEditMode>
      <RecordTableFocusModeHotkeysSetterEffect />
    </RecordTableCellPortalWrapper>
  );
};
