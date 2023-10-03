import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

import { useIsFieldInputOnly } from '@/ui/field/hooks/useIsFieldInputOnly';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentTableCellEditMode } from '../hooks/useCurrentTableCellEditMode';
import { useIsSoftFocusOnCurrentTableCell } from '../hooks/useIsSoftFocusOnCurrentTableCell';
import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellDisplayMode } from './TableCellDisplayMode';
import { TableCellEditButton } from './TableCellEditButton';
import { TableCellEditMode } from './TableCellEditMode';
import { TableCellSoftFocusMode } from './TableCellSoftFocusMode';

const StyledCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
`;

export type EditableCellProps = {
  editModeContent: ReactElement;
  nonEditModeContent: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  editHotkeyScope?: HotkeyScope;
  transparent?: boolean;
  maxContentWidth?: number;
  useEditButton?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export const TableCellContainer = ({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
  transparent = false,
  maxContentWidth,
  useEditButton,
}: EditableCellProps) => {
  const { isCurrentTableCellInEditMode } = useCurrentTableCellEditMode();
  const [isHovered, setIsHovered] = useState(false);

  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();

  const { openTableCell } = useTableCell();

  const handlePenClick = () => {
    setSoftFocusOnCurrentTableCell();
    openTableCell();
  };

  const handleContainerMouseEnter = () => {
    setIsHovered(true);
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const editModeContentOnly = useIsFieldInputOnly();

  const showEditButton =
    useEditButton &&
    isHovered &&
    !isCurrentTableCellInEditMode &&
    !editModeContentOnly;

  const hasSoftFocus = useIsSoftFocusOnCurrentTableCell();

  return (
    <CellHotkeyScopeContext.Provider
      value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
    >
      <StyledCellBaseContainer
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {isCurrentTableCellInEditMode ? (
          <TableCellEditMode
            maxContentWidth={maxContentWidth}
            transparent={transparent}
            editModeHorizontalAlign={editModeHorizontalAlign}
            editModeVerticalPosition={editModeVerticalPosition}
          >
            {editModeContent}
          </TableCellEditMode>
        ) : hasSoftFocus ? (
          <>
            {showEditButton && <TableCellEditButton onClick={handlePenClick} />}
            <TableCellSoftFocusMode>
              {editModeContentOnly ? editModeContent : nonEditModeContent}
            </TableCellSoftFocusMode>
          </>
        ) : (
          <>
            {showEditButton && <TableCellEditButton onClick={handlePenClick} />}
            <TableCellDisplayMode isHovered={isHovered}>
              {editModeContentOnly ? editModeContent : nonEditModeContent}
            </TableCellDisplayMode>
          </>
        )}
      </StyledCellBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
};
