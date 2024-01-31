import { ReactElement, useContext, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { useGetButtonIcon } from '@/object-record/record-field/hooks/useGetButtonIcon';
import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/hooks/useIsFieldInputOnly';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useGetIsSomeCellInEditModeState } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { useOpenRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useOpenRecordTableCell';
import { IconArrowUpRight } from '@/ui/display/icon';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

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
  const isSomeCellInEditMode = useRecoilValue(isSomeCellInEditModeState());

  const moveSoftFocusToCurrentCellOnHover =
    useMoveSoftFocusToCurrentCellOnHover();

  const hasSoftFocus = useIsSoftFocusOnCurrentTableCell();
  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const { openTableCell } = useOpenRecordTableCell();

  const handleButtonClick = () => {
    setSoftFocusOnCurrentTableCell();
    openTableCell();
  };

  const handleContainerMouseEnter = () => {
    if (!isHovered && !isSomeCellInEditMode) {
      setIsHovered(true);
      moveSoftFocusToCurrentCellOnHover();
    }
  };

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
  );
};
