import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
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
    ${({
      isReadOnly,
      fontColorMedium,
      backgroundColorSecondary,
      fontColorSecondary,
    }) =>
      isReadOnly
        ? `
      outline: 1px solid ${fontColorMedium};
      border-radius: 0px;
      background-color: ${backgroundColorSecondary};
      
      color: ${fontColorSecondary};
      
      svg {
        color: ${fontColorSecondary};
      }
      
      img {
        opacity: 0.64;
      }
    `
        : ''}
  }
`;

export const RecordTableCellBaseContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { isReadOnly } = useContext(FieldContext);
  const { setIsFocused } = useFieldFocus();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { theme } = useContext(ThemeContext);

  const { cellPosition } = useContext(RecordTableCellContext);

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
    >
      {children}
    </StyledBaseContainer>
  );
};
