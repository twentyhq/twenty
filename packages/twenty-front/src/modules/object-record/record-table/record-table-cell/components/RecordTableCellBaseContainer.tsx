import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { isFieldIdentifierDisplay } from '@/object-record/record-field/meta-types/display/utils/isFieldIdentifierDisplay';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/record-table/constants/RecordChipClickOutsideId';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { BORDER_COMMON, ThemeContext } from 'twenty-ui/theme';

const StyledBaseContainer = styled.div<{
  fontColorExtraLight: string;
  fontColorMedium: string;
  backgroundColorTransparentSecondary: string;
  backgroundColorSecondary: string;
  fontColorSecondary: string;
  isReadOnly: boolean;
  borderColorBlue: string;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  &.focus-active {
    border-radius: ${BORDER_COMMON.radius.sm};
    outline: 1px solid ${({ borderColorBlue }) => borderColorBlue};
  }

  &:hover {
    ${(props) => {
      if (!props.isReadOnly) return '';

      return `
        outline: 1px solid ${props.fontColorMedium};
        border-radius: 0px;
        background-color: ${props.backgroundColorSecondary};
        color: ${props.fontColorSecondary};
        
        svg {
          color: ${props.fontColorSecondary};
        }
        
        img {
          opacity: 0.64;
        }
      `;
    }}
  }
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
  const { setIsFocused } = useFieldFocus();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { theme } = useContext(ThemeContext);

  const { cellPosition } = useContext(RecordTableCellContext);

  const isChipDisplay = isFieldIdentifierDisplay(
    fieldDefinition,
    isLabelIdentifier,
  );
  const { onMoveHoverToCurrentCell, onCellMouseEnter } =
    useRecordTableBodyContextOrThrow();

  const handleContainerMouseMove = () => {
    setIsFocused(true);
    onCellMouseEnter({
      cellPosition,
    });
  };

  const handleContainerMouseLeave = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    onMoveHoverToCurrentCell(cellPosition);
    openTableCell();
  };

  return (
    <StyledBaseContainer
      onMouseLeave={handleContainerMouseLeave}
      onMouseMove={handleContainerMouseMove}
      onClick={handleContainerClick}
      backgroundColorTransparentSecondary={
        theme.background.transparent.secondary
      }
      backgroundColorSecondary={theme.background.secondary}
      fontColorExtraLight={theme.font.color.extraLight}
      fontColorSecondary={theme.font.color.secondary}
      fontColorMedium={theme.border.color.medium}
      borderColorBlue={theme.adaptiveColors.blue4}
      isReadOnly={isReadOnly ?? false}
      id={`record-table-cell-${cellPosition.column}-${cellPosition.row}`}
      data-click-outside-id={
        isChipDisplay ? RECORD_CHIP_CLICK_OUTSIDE_ID : undefined
      }
    >
      {children}
    </StyledBaseContainer>
  );
};
