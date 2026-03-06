import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusStaticFocusedProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellDisplayMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellDisplayMode';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { RecordTableCellEditMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditMode';
import { RecordTableCellFieldInput } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldInput';

import { isRecordTableRowActiveComponentFamilyState } from '@/object-record/record-table/states/isRecordTableRowActiveComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledRecordTableCellHoveredPortalContent = styled.div<{
  showInteractiveStyle: boolean;
  isRecordTableRowActive: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.secondary};
  background-color: ${({ isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? themeCssVariables.accent.quaternary
      : themeCssVariables.background.primary};
  border-radius: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? themeCssVariables.border.radius.sm : 'none'};
  box-sizing: border-box;
  cursor: ${({ showInteractiveStyle }) =>
    showInteractiveStyle ? 'pointer' : 'default'};
  display: flex;

  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  outline: ${({ showInteractiveStyle, isRecordTableRowActive }) =>
    isRecordTableRowActive
      ? 'none'
      : showInteractiveStyle
        ? `1px solid ${themeCssVariables.font.color.extraLight}`
        : `1px solid ${themeCssVariables.border.color.medium}`};
  outline-offset: -1px;

  user-select: none;
`;

export const RecordTableCellHoveredPortalContent = () => {
  const recordTableHoverPosition = useAtomComponentStateValue(
    recordTableHoverPositionComponentState,
  );

  const isMobile = useIsMobile();

  const isFirstColumn = recordTableHoverPosition?.column === 0;

  const { isRecordFieldReadOnly: isReadOnly } = useContext(FieldContext);

  const isFieldInputOnly = useIsFieldInputOnly();

  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle = !isReadOnly || (isFirstColumn && showButton);

  const { rowIndex } = useRecordTableRowContextOrThrow();

  const isRecordTableRowActive = useAtomComponentFamilyStateValue(
    isRecordTableRowActiveComponentFamilyState,
    rowIndex,
  );

  return (
    <StyledRecordTableCellHoveredPortalContent
      showInteractiveStyle={showInteractiveStyle}
      isRecordTableRowActive={isRecordTableRowActive}
    >
      <FieldFocusStaticFocusedProvider>
        {isFieldInputOnly ? (
          <RecordTableCellEditMode>
            <RecordTableCellFieldInput />
          </RecordTableCellEditMode>
        ) : (
          <RecordTableCellDisplayMode>
            <FieldDisplay />
          </RecordTableCellDisplayMode>
        )}
      </FieldFocusStaticFocusedProvider>
      {showButton && <RecordTableCellEditButton />}
    </StyledRecordTableCellHoveredPortalContent>
  );
};
