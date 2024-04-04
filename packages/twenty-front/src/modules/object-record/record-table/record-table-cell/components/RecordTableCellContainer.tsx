import { ReactElement, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { IconArrowUpRight } from 'twenty-ui';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { isSoftFocusUsingMouseState } from '@/object-record/record-table/states/isSoftFocusUsingMouseState';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentTableCellEditMode } from '../hooks/useCurrentTableCellEditMode';
import { useIsSoftFocusOnCurrentTableCell } from '../hooks/useIsSoftFocusOnCurrentTableCell';
import { useMoveSoftFocusToCurrentCellOnHover } from '../hooks/useMoveSoftFocusToCurrentCellOnHover';
import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';

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
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
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
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
}: RecordTableCellContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const { isCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const isSomeCellInEditModeState = useGetIsSomeCellInEditModeState();

  const setIsSoftFocusUsingMouseState = useSetRecoilState(
    isSoftFocusUsingMouseState,
  );

  const moveSoftFocusToCurrentCellOnHover =
    useMoveSoftFocusToCurrentCellOnHover();

  const hasSoftFocus = useIsSoftFocusOnCurrentTableCell();
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const { openTableCell } = useOpenRecordTableCell();

  const handleButtonClick = () => {
    setSoftFocusOnCurrentTableCell();
    openTableCell();
  };

  const { isSelected } = useContext(RecordTableRowContext);

  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentRowSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  };

  const handleContainerMouseEnter = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isSomeCellInEditModeState(),
        );
        if (!isHovered && !isSomeCellInEditMode) {
          setIsHovered(true);
          moveSoftFocusToCurrentCellOnHover();
          setIsSoftFocusUsingMouseState(true);
        }
      },
    [
      isHovered,
      isSomeCellInEditModeState,
      moveSoftFocusToCurrentCellOnHover,
      setIsSoftFocusUsingMouseState,
    ],
  );

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const editModeContentOnly = useIsFieldInputOnly();

  const isEmpty = useIsFieldEmpty();

  const { columnIndex } = useContext(RecordTableCellContext);
  const isFirstColumn = columnIndex === 0;
  const customButtonIcon = useGetButtonIcon();
  const buttonIcon = isFirstColumn ? IconArrowUpRight : customButtonIcon;

  const showButton =
    !!buttonIcon &&
    hasSoftFocus &&
    !isCurrentTableCellInEditMode &&
    !editModeContentOnly &&
    (!isFirstColumn || !isEmpty);

  return (
    <StyledTd
      isSelected={isSelected}
      onContextMenu={(event) => handleContextMenu(event)}
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
            <RecordTableCellEditMode
              editModeHorizontalAlign={editModeHorizontalAlign}
              editModeVerticalPosition={editModeVerticalPosition}
            >
              {editModeContent}
            </RecordTableCellEditMode>
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
              <RecordTableCellDisplayMode>
                {editModeContentOnly ? editModeContent : nonEditModeContent}
              </RecordTableCellDisplayMode>
            </>
          )}
        </StyledCellBaseContainer>
      </CellHotkeyScopeContext.Provider>
    </StyledTd>
  );
};
