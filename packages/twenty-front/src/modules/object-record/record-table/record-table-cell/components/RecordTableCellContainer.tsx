import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { styled } from '@linaria/react';
import { BORDER_COMMON, ThemeContext } from 'twenty-ui';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellSoftFocusMode } from '@/object-record/record-table/record-table-cell/components/RecordTableCellSoftFocusMode';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';

const StyledTd = styled.td<{
  isInEditMode: boolean;
  backgroundColor: string;
}>`
  background: ${({ backgroundColor }) => backgroundColor};
  z-index: ${({ isInEditMode }) => (isInEditMode ? '4 !important' : 3)};
`;

const borderRadiusSm = BORDER_COMMON.radius.sm;

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
    hasSoftFocus ? borderRadiusSm : 'none'};

  border: ${({ hasSoftFocus, fontColorExtraLight }) =>
    hasSoftFocus ? `1px solid ${fontColorExtraLight}` : 'none'};
`;

export type RecordTableCellContainerProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editHotkeyScope?: HotkeyScope;
  transparent?: boolean;
  maxContentWidth?: number;
  onSubmit?: () => void;
  onCancel?: () => void;
};

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const RecordTableCellContainer = ({
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
}: RecordTableCellContainerProps) => {
  const { theme } = useContext(ThemeContext);

  const { setIsFocused } = useFieldFocus();
  const { openTableCell } = useOpenRecordTableCellFromCell();

  const { isSelected, recordId, isPendingRow } = useContext(
    RecordTableRowContext,
  );
  const { isLabelIdentifier } = useContext(FieldContext);
  const { onContextMenu, onCellMouseEnter } = useContext(RecordTableContext);

  const shouldBeInitiallyInEditMode =
    isPendingRow === true && isLabelIdentifier;

  const [hasSoftFocus, setHasSoftFocus] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(shouldBeInitiallyInEditMode);

  const cellPosition = useCurrentTableCellPosition();

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseMove = () => {
    if (!hasSoftFocus) {
      onCellMouseEnter({
        cellPosition,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setHasSoftFocus(false);
    setIsFocused(false);
  };

  const handleContainerClick = () => {
    if (!hasSoftFocus) {
      openTableCell();
    }
  };

  useEffect(() => {
    const customEventListener = (event: any) => {
      event.stopPropagation();

      const newHasSoftFocus = event.detail;

      setHasSoftFocus(newHasSoftFocus);
      setIsFocused(newHasSoftFocus);
    };

    document.addEventListener(
      `soft-focus-move-${cellPosition.row}:${cellPosition.column}`,
      customEventListener,
    );

    return () => {
      document.removeEventListener(
        `soft-focus-move-${cellPosition.row}:${cellPosition.column}`,
        customEventListener,
      );
    };
  }, [cellPosition, setIsFocused]);

  useEffect(() => {
    const customEventListener = (event: any) => {
      const newIsInEditMode = event.detail;

      setIsInEditMode(newIsInEditMode);
    };

    document.addEventListener(
      `edit-mode-change-${cellPosition.row}:${cellPosition.column}`,
      customEventListener,
    );

    return () => {
      document.removeEventListener(
        `edit-mode-change-${cellPosition.row}:${cellPosition.column}`,
        customEventListener,
      );
    };
  }, [cellPosition]);

  const tdBackgroundColor = isSelected
    ? theme.accent.quaternary
    : theme.background.primary;

  return (
    <StyledTd
      backgroundColor={tdBackgroundColor}
      isInEditMode={isInEditMode}
      onContextMenu={handleContextMenu}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
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
          {isInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <RecordTableCellSoftFocusMode
              editModeContent={editModeContent}
              nonEditModeContent={nonEditModeContent}
            />
          ) : (
            <RecordTableCellDisplayMode>
              {nonEditModeContent}
            </RecordTableCellDisplayMode>
          )}
        </StyledBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};
