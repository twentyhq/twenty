import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { BORDER_COMMON } from 'twenty-ui/theme';

const StyledRecordTableCellFocusPortalContent = styled.div<{
  isRecordTableRowActive: boolean;
}>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.secondary};
  background-color: ${({ theme, isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? theme.accent.quaternary
      : theme.background.primary};
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

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const arePositionsDifferent =
    recordTableHoverPosition?.row !== recordTableFocusPosition?.row ||
    recordTableHoverPosition?.column !== recordTableFocusPosition?.column;

  const handleContainerMouseMove = () => {
    if (arePositionsDifferent && isDefined(recordTableFocusPosition)) {
      onMoveHoverToCurrentCell(recordTableFocusPosition);
    }
  };

  return (
    <StyledRecordTableCellFocusPortalContent
      isRecordTableRowActive={isRecordTableRowActive}
      onMouseMove={handleContainerMouseMove}
    >
      <RecordTableCellDisplayMode>
        <FieldDisplay />
      </RecordTableCellDisplayMode>
    </StyledRecordTableCellFocusPortalContent>
  );
};
