import { RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME } from '@/object-record/record-table/constants/RecordTableRowBackgroundCssVariableName';
import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';

import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRecordTableCellFocusPortalContent = styled.div`
  align-items: center;
  background-color: var(
    ${RECORD_TABLE_ROW_BACKGROUND_CSS_VARIABLE_NAME},
    ${themeCssVariables.background.primary}
  );
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: inset 0 0 0 2px ${themeCssVariables.accent.tertiary};
  box-sizing: border-box;
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: 1px solid ${themeCssVariables.accent.accent8};
  outline-offset: -1px;

  user-select: none;
`;

export const RecordTableCellFocusedPortalContent = () => {
  const { onMoveHoverToCurrentCell } = useRecordTableBodyContextOrThrow();

  const recordTableFocusPosition = useAtomComponentStateValue(
    recordTableFocusPositionComponentState,
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
      onMouseMove={handleContainerMouseMove}
    >
      <RecordTableCellDisplayMode>
        <FieldDisplay />
      </RecordTableCellDisplayMode>
    </StyledRecordTableCellFocusPortalContent>
  );
};
