import React, { ReactElement, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { IconArrowUpRight } from 'twenty-ui';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { useOpenRecordTableCellFromCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCellFromCell';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

import { RecordTableCellButton } from './RecordTableCellButton';
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
  const { columnIndex, fieldCellValue } = useContext(RecordTableCellContext);
  const { isReadOnly, isSelected, recordId } = useContext(
    RecordTableRowContext,
  );
  const { onMoveSoftFocusToCell, onContextMenu, onCellMouseEnter } =
    useContext(RecordTableContext);

  const cellPosition = useCurrentTableCellPosition();

  const [isHovered, setIsHovered] = useState(false);

  const { openTableCell } = useOpenRecordTableCellFromCell();

  const handleButtonClick = () => {
    onMoveSoftFocusToCell(cellPosition);
    openTableCell();
  };

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

  const editModeContentOnly = useIsFieldInputOnly();

  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn ? IconArrowUpRight : customButtonIcon;

  const {
    hasSoftFocus,
    isEmpty,
    isInEditMode: isCurrentTableCellInEditMode,
  } = fieldCellValue;

  const showButton =
    !!buttonIcon &&
    hasSoftFocus &&
    !isCurrentTableCellInEditMode &&
    !editModeContentOnly &&
    (!isFirstColumn || !isEmpty) &&
    !isReadOnly;

  return (
    <StyledTd
      isSelected={isSelected}
      onContextMenu={handleContextMenu}
      isInEditMode={isCurrentTableCellInEditMode}
    >
      <CellHotkeyScopeContext.Provider
        value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
      >
        <StyledCellBaseContainer
          onMouseEnter={handleContainerMouseEnter}
          onMouseLeave={handleContainerMouseLeave}
        >
          {isCurrentTableCellInEditMode ? (
            <RecordTableCellEditMode>{editModeContent}</RecordTableCellEditMode>
          ) : hasSoftFocus ? (
            <>
              {showButton && (
                <RecordTableCellButton
                  onClick={handleButtonClick}
                  Icon={buttonIcon}
                />
              )}
              <RecordTableCellSoftFocusMode>
                {editModeContentOnly ? editModeContent : nonEditModeContent}
              </RecordTableCellSoftFocusMode>
            </>
          ) : (
            <>
              {showButton && (
                <RecordTableCellButton
                  onClick={handleButtonClick}
                  Icon={buttonIcon}
                />
              )}
              {!isEmpty && (
                <RecordTableCellDisplayMode>
                  {editModeContentOnly ? editModeContent : nonEditModeContent}
                </RecordTableCellDisplayMode>
              )}
            </>
          )}
        </StyledCellBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};
