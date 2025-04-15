import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { BORDER_COMMON, ThemeContext } from 'twenty-ui/theme';

const StyledBaseContainer = styled.div<{
  hasFocus: boolean;
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

  background: ${({ hasFocus, backgroundColorTransparentSecondary }) =>
    hasFocus ? backgroundColorTransparentSecondary : 'none'};

  border-radius: ${({ hasFocus, isReadOnly }) =>
    hasFocus && !isReadOnly ? BORDER_COMMON.radius.sm : 'none'};

  outline: ${({
    hasFocus,
    fontColorExtraLight,
    fontColorMedium,
    isReadOnly,
  }) =>
    hasFocus
      ? isReadOnly
        ? `1px solid ${fontColorMedium}`
        : `1px solid ${fontColorExtraLight}`
      : 'none'};
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

  const { hasFocus, cellPosition } = useContext(RecordTableCellContext);

  const { onMoveFocusToCurrentCell, onCellMouseEnter } =
    useRecordTableBodyContextOrThrow();

  const handleContainerMouseMove = () => {
    setIsFocused(true);
    if (!hasFocus) {
      onCellMouseEnter({
        cellPosition,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (!hasFocus) {
      onMoveFocusToCurrentCell(cellPosition);
      openTableCell();
    }
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
      hasFocus={hasFocus}
      isReadOnly={isReadOnly ?? false}
    >
      {children}
    </StyledBaseContainer>
  );
};
