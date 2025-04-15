import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { ThemeContext } from 'twenty-ui/theme';

const StyledBaseContainer = styled.div<{
  fontColorExtraLight: string;
  fontColorMedium: string;
  backgroundColorTransparentSecondary: string;
  isReadOnly: boolean;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ isReadOnly }) => (isReadOnly ? 'default' : 'pointer')};
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
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

  const { onMoveFocusToCurrentCell, onCellMouseEnter } =
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
    onMoveFocusToCurrentCell(cellPosition);
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
      fontColorExtraLight={theme.font.color.extraLight}
      fontColorMedium={theme.border.color.medium}
      isReadOnly={isReadOnly ?? false}
      id={`record-table-cell-${cellPosition.column}-${cellPosition.row}`}
    >
      {children}
    </StyledBaseContainer>
  );
};
