import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellFieldDisplay } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldDisplay';
import { useRecordTableCellOutlinePortal } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellOutlinePortal';

import { isRecordTableRowActiveByRecordIdComponentFamilySelector } from '@/object-record/record-table/states/selectors/isRecordTableRowActiveByRecordIdComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRecordTableCellFocusPortalContent = styled.div<{
  isRecordTableRowActive: boolean;
  isTopEdgeCoveredByHeader: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${({ isTopEdgeCoveredByHeader }) =>
    isTopEdgeCoveredByHeader
      ? `inset 0 1px 0 0 ${themeCssVariables.color.blue8}`
      : 'none'};
  box-sizing: border-box;
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: 1px solid ${themeCssVariables.color.blue8};

  user-select: none;
`;

export const RecordTableCellFocusedPortalContent = () => {
  const { recordId } = useRecordTableRowContextOrThrow();
  const { onMoveHoverToCurrentCell } = useRecordTableBodyContextOrThrow();

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
  );

  const isRecordTableRowActive = useAtomComponentFamilySelectorValue(
    isRecordTableRowActiveByRecordIdComponentFamilySelector,
    recordId,
  );

  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const { isTopEdgeCoveredByHeader } = useRecordTableCellOutlinePortal(
    recordTableFocusPosition,
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
      isTopEdgeCoveredByHeader={isTopEdgeCoveredByHeader}
      onMouseMove={handleContainerMouseMove}
    >
      <RecordTableCellDisplayMode>
        <RecordTableCellFieldDisplay />
      </RecordTableCellDisplayMode>
    </StyledRecordTableCellFocusPortalContent>
  );
};
