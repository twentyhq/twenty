import { RecordTableCellPortalWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellPortalWrapper';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';
import { RecordTableCellHotkeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHotkeysEffect';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import styled from '@emotion/styled';

const StyledRecordTableCellHoveredPortal = styled.div`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`;

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
        <StyledRecordTableCellHoveredPortal>
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        </StyledRecordTableCellHoveredPortal>
      )}
      <RecordTableCellHotkeysEffect />
    </RecordTableCellPortalWrapper>
  );
};
