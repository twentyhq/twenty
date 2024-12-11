import { styled } from '@linaria/react';
import { ReactNode, useContext } from 'react';
import { BORDER_COMMON, ThemeContext } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { CellHotkeyScopeContext } from '@/object-record/record-table/contexts/CellHotkeyScopeContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import {
  DEFAULT_CELL_SCOPE,
  useOpenRecordTableCellFromCell,
} from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';

const StyledBaseContainer = styled.div<{
  hasSoftFocus: boolean;
  fontColorExtraLight: string;
  backgroundColorTransparentSecondary: string;
}>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;

  background: ${({ hasSoftFocus, backgroundColorTransparentSecondary }) =>
    hasSoftFocus ? backgroundColorTransparentSecondary : 'none'};

  border-radius: ${({ hasSoftFocus }) =>
    hasSoftFocus ? BORDER_COMMON.radius.sm : 'none'};

  outline: ${({ hasSoftFocus, fontColorExtraLight }) =>
    hasSoftFocus ? `1px solid ${fontColorExtraLight}` : 'none'};
`;

export const RecordTableCellBaseContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { setIsFocused } = useFieldFocus();
  const { openTableCell } = useOpenRecordTableCellFromCell();
  const { theme } = useContext(ThemeContext);

  const { hasSoftFocus, cellPosition } = useContext(RecordTableCellContext);

  const { onMoveSoftFocusToCell, onCellMouseEnter } =
    useRecordTableBodyContextOrThrow();

  const handleContainerMouseMove = () => {
    setIsFocused(true);
    if (!hasSoftFocus) {
      onCellMouseEnter({
        cellPosition,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (!hasSoftFocus) {
      onMoveSoftFocusToCell(cellPosition);
      openTableCell();
    }
  };

  const { hotkeyScope } = useContext(FieldContext);

  const editHotkeyScope = { scope: hotkeyScope ?? DEFAULT_CELL_SCOPE };

  return (
    <CellHotkeyScopeContext.Provider value={editHotkeyScope}>
      <StyledBaseContainer
        onMouseLeave={handleContainerMouseLeave}
        onMouseMove={handleContainerMouseMove}
        onClick={handleContainerClick}
        backgroundColorTransparentSecondary={
          theme.background.transparent.secondary
        }
        fontColorExtraLight={theme.font.color.extraLight}
        hasSoftFocus={hasSoftFocus}
      >
        {children}
      </StyledBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
};
