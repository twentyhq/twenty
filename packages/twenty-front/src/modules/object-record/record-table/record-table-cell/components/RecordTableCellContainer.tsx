import React, { ReactElement, useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';
import { RecordTableCellSoftFocusMode } from './RecordTableCellSoftFocusMode';

const StyledTd = styled.td<{ isSelected: boolean; isInEditMode: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : theme.background.primary};
  z-index: ${({ isInEditMode }) => (isInEditMode ? '4 !important' : '3')};
`;

const StyledCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
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
  const [hasSoftFocus, setHasSoftFocus] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);

  const { isFieldInputOnly } = useContext(FieldContext);

  const { isSelected, recordId } = useContext(RecordTableRowContext);
  const { onContextMenu, onCellMouseEnter } = useContext(RecordTableContext);

  const cellPosition = useCurrentTableCellPosition();

  const [isHovered, setIsHovered] = useState(false);

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseEnter = () => {
    onCellMouseEnter({
      cellPosition,
      isHovered,
      setIsHovered,
    });
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  // const isEmpty = useIsFieldEmpty();

  // < 0.1ms
  useEffect(() => {
    const customEventListener = (event: any) => {
      const newHasSoftFocus = event.detail;

      setHasSoftFocus(newHasSoftFocus);
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
  }, [cellPosition]);

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

  return (
    <StyledTd
      isSelected={isSelected}
      onContextMenu={handleContextMenu}
      isInEditMode={isInEditMode}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
        <StyledCellBaseContainer
          onMouseEnter={handleContainerMouseEnter}
          onMouseLeave={handleContainerMouseLeave}
        >
          {isInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <RecordTableCellSoftFocusMode>
              {isFieldInputOnly === true ? editModeContent : nonEditModeContent}
            </RecordTableCellSoftFocusMode>
          ) : (
            <RecordTableCellDisplayMode>
              {isFieldInputOnly === true ? editModeContent : nonEditModeContent}
            </RecordTableCellDisplayMode>
          )}
        </StyledCellBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};
