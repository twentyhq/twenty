import React, { ReactElement, useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';

import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellDisplayMode } from './RecordTableCellDisplayMode';
import { RecordTableCellEditMode } from './RecordTableCellEditMode';
import { RecordTableCellSoftFocusMode } from './RecordTableCellSoftFocusMode';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';

const StyledTd = styled.td<{ isSelected: boolean; isInEditMode: boolean }>`
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.accent.quaternary : theme.background.primary};
  z-index: ${({ isInEditMode }) => (isInEditMode ? '4 !important' : '3')};
`;

const StyledCellBaseContainer = styled.div<{ softFocus: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  ${(props) =>
    props.softFocus
      ? `background: ${props.theme.background.transparent.secondary};
      border-radius: ${props.theme.border.radius.sm};
      outline: 1px solid ${props.theme.font.color.extraLight};`
      : ''}
`;

export type RecordTableCellContainerProps = {
  editModeContent: ReactElement;
  nonEditModeContent?: ({
    isCellSoftFocused,
    cellElement,
  }: {
    isCellSoftFocused: boolean;
    cellElement?: HTMLTableCellElement;
  }) => ReactElement;
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
  const { columnIndex } = useContext(RecordTableCellContext);
  // Used by some fields in ExpandableList as an anchor for the floating element.
  // floating-ui mentions that `useState` must be used instead of `useRef`,
  // see https://floating-ui.com/docs/useFloating#elements
  const [cellElement, setCellElement] = useState<HTMLTableCellElement | null>(
    null,
  );
  const [isCellBaseContainerHovered, setIsCellBaseContainerHovered] =
    useState(false);
  const { isReadOnly, isSelected, recordId } = useContext(
    RecordTableRowContext,
  );
  const { onMoveSoftFocusToCell, onContextMenu, onCellMouseEnter } =
    useContext(RecordTableContext);

  const cellPosition = useCurrentTableCellPosition();

  const handleContextMenu = (event: React.MouseEvent) => {
    onContextMenu(event, recordId);
  };

  const handleContainerMouseEnter = () => {
    if (!hasSoftFocus) {
      onCellMouseEnter({
        cellPosition,
        isHovered,
        setIsHovered,
      });
    }
  };

  const handleContainerMouseLeave = () => {
    setIsCellBaseContainerHovered(false);
  };

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
      ref={setCellElement}
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
          onMouseMove={handleContainerMouseEnter}
          softFocus={hasSoftFocus}
        >
          {isInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <>
              <RecordTableCellSoftFocusMode
                editModeContent={editModeContent}
                nonEditModeContent={nonEditModeContent}
              />
            </>
          ) : (
            <RecordTableCellDisplayMode>
              {nonEditModeContent}
            </RecordTableCellDisplayMode>
          )}
        </StyledCellBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};
