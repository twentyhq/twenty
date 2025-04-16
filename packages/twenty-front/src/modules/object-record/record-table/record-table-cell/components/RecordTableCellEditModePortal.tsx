import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { RecordTableFocusModeHotkeysSetterEffect } from '@/object-record/record-table/components/RecordTableFocusModeHotkeysSetterEffect';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { focusPositionComponentState } from '@/object-record/record-table/states/focusPositionComponentState';
import styled from '@emotion/styled';

const StyledRecordTableCellHoveredPortal = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const RecordTableCellEditModePortal = () => {
  const focusedCellPosition = useRecoilComponentValueV2(
    focusPositionComponentState,
  );

  const currentTableCellInEditModePosition = useRecoilComponentValueV2(
    currentTableCellInEditModePositionComponentState,
  );

  if (!focusedCellPosition) {
    return null;
  }

  return (
    <RecordTableCellPortalWrapper position={focusedCellPosition}>
      {currentTableCellInEditModePosition && (
        <StyledRecordTableCellHoveredPortal>
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        </StyledRecordTableCellHoveredPortal>
      )}
      <RecordTableFocusModeHotkeysSetterEffect />
    </RecordTableCellPortalWrapper>
  );
};
