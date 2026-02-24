import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyValueV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { BORDER_COMMON } from 'twenty-ui/theme';

const StyledRecordTableCellFocusPortalContent = styled.div<{
  isRowActive: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRowActive }) =>
    isRowActive ? theme.accent.quaternary : theme.background.primary};
  border-radius: ${BORDER_COMMON.radius.sm};
  box-sizing: border-box;
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: ${({ theme }) => `1px solid ${theme.color.blue8}`};

  user-select: none;
`;

export const RecordTableCellFocusedPortalContent = () => {
  const { rowIndex } = useRecordTableRowContextOrThrow();
  const { onMoveHoverToCurrentCell } = useRecordTableBodyContextOrThrow();

  const focusPosition = useRecoilComponentValueV2(
    recordTableFocusPositionComponentState,
  );

  const isRowActive = useRecoilComponentFamilyValueV2(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  const hoverPosition = useRecoilComponentValueV2(
    recordTableHoverPositionComponentState,
  );

  const arePositionsDifferent =
    hoverPosition?.row !== focusPosition?.row ||
    hoverPosition?.column !== focusPosition?.column;

  const handleContainerMouseMove = () => {
    if (arePositionsDifferent && isDefined(focusPosition)) {
      onMoveHoverToCurrentCell(focusPosition);
    }
  };

  return (
    <StyledRecordTableCellFocusPortalContent
      isRowActive={isRowActive}
      onMouseMove={handleContainerMouseMove}
    >
      <RecordTableCellDisplayMode>
        <FieldDisplay />
      </RecordTableCellDisplayMode>
    </StyledRecordTableCellFocusPortalContent>
  );
};
