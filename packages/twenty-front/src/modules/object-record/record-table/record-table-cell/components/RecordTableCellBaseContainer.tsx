import { styled } from '@linaria/react';
import { useContext, type ReactNode } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/ui/meta-types/display/utils/isFieldIdentifierDisplay';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/record-table/constants/RecordChipClickOutsideId';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellEditButton } from '@/object-record/record-table/record-table-cell/components/RecordTableCellEditButton';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { getRecordTableCellId } from '@/object-record/record-table/utils/getRecordTableCellId';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';
import { useIsMobile } from 'twenty-ui-deprecated/utilities';

// Class shared with the `&:hover` rule below so the edit button is revealed
// through pure CSS instead of a portal that follows the mouse.
const HOVER_AFFORDANCE_CLASS_NAME = 'record-table-cell-hover-affordance';

const StyledBaseContainer = styled.div<{
  fontColorMedium: string;
  backgroundColorSecondary: string;
  fontColorSecondary: string;
  isReadOnly: boolean;
  showInteractiveStyle: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  position: relative;

  user-select: none;

  &:hover {
    background-color: ${({ isReadOnly, backgroundColorSecondary }) =>
      isReadOnly ? backgroundColorSecondary : 'unset'};
    border-radius: ${({ isReadOnly, showInteractiveStyle }) =>
      isReadOnly
        ? '0px'
        : showInteractiveStyle
          ? themeCssVariables.border.radius.sm
          : 'unset'};
    color: ${({ isReadOnly, fontColorSecondary }) =>
      isReadOnly ? fontColorSecondary : 'unset'};
    outline: ${({ isReadOnly, showInteractiveStyle, fontColorMedium }) =>
      isReadOnly
        ? `1px solid ${fontColorMedium}`
        : showInteractiveStyle
          ? `1px solid ${themeCssVariables.font.color.extraLight}`
          : 'unset'};
    outline-offset: -1px;

    svg {
      color: ${({ isReadOnly, fontColorSecondary }) =>
        isReadOnly ? fontColorSecondary : 'unset'};
    }

    img {
      opacity: ${({ isReadOnly }) => (isReadOnly ? '0.64' : 'unset')};
    }

    .${HOVER_AFFORDANCE_CLASS_NAME} {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

// Sits on the right edge of the cell, hidden until the cell is hovered.
// Replaces the old hovered portal that re-rendered the cell content + button.
const StyledHoverAffordance = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
`;

export const RecordTableCellBaseContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const {
    isRecordFieldReadOnly: isReadOnly,
    fieldDefinition,
    isLabelIdentifier,
  } = useContext(FieldContext);
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  const { cellPosition } = useContext(RecordTableCellContext);
  const { recordTableId } = useRecordTableContextOrThrow();

  const isChipDisplay = isFieldIdentifierDisplay(
    fieldDefinition,
    isLabelIdentifier,
  );

  const isFirstColumn = cellPosition.column === 0;
  const isFieldInputOnly = useIsFieldInputOnly() && !isReadOnly;

  // Mirrors the previous hovered-portal logic: the edit/open button shows on
  // hover for editable cells and the first column, except input-only fields
  // and the mobile first column.
  const showButton =
    !isFieldInputOnly &&
    (!isReadOnly || isFirstColumn) &&
    !(isMobile && isFirstColumn);

  const showInteractiveStyle = !isReadOnly || (isFirstColumn && showButton);

  const handleContainerClick = () => {
    openTableCell();
  };

  return (
    <StyledBaseContainer
      onClick={handleContainerClick}
      backgroundColorSecondary={theme.background.secondary}
      fontColorSecondary={theme.font.color.secondary}
      fontColorMedium={theme.border.color.medium}
      isReadOnly={isReadOnly ?? false}
      showInteractiveStyle={showInteractiveStyle}
      id={getRecordTableCellId(
        recordTableId,
        cellPosition.column,
        cellPosition.row,
      )}
      data-record-table-col={cellPosition.column}
      data-record-table-row={cellPosition.row}
      data-click-outside-id={
        isChipDisplay ? RECORD_CHIP_CLICK_OUTSIDE_ID : undefined
      }
    >
      {children}
      {showButton && (
        <StyledHoverAffordance className={HOVER_AFFORDANCE_CLASS_NAME}>
          <RecordTableCellEditButton />
        </StyledHoverAffordance>
      )}
    </StyledBaseContainer>
  );
};
