import { ReactElement, useContext, useState } from 'react';
import styled from '@emotion/styled';

import { useIsFieldEmpty } from '@/ui/field/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/ui/field/hooks/useIsFieldInputOnly';
import { IconComponent } from '@/ui/icon/types/IconComponent';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { ColumnIndexContext } from '../../contexts/ColumnIndexContext';
import { useSomeCellInEditMode } from '../../hooks/useSomeCellInEditMode';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentTableCellEditMode } from '../hooks/useCurrentTableCellEditMode';
import { useIsSoftFocusOnCurrentTableCell } from '../hooks/useIsSoftFocusOnCurrentTableCell';
import { useSetSoftFocusOnCurrentTableCell } from '../hooks/useSetSoftFocusOnCurrentTableCell';
import { useTableCell } from '../hooks/useTableCell';

import { TableCellButton } from './TableCellButton';
import { TableCellDisplayMode } from './TableCellDisplayMode';
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
  buttonIcon?: IconComponent;
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
  buttonIcon,
}: EditableCellProps) => {
  const { isCurrentTableCellInEditMode } = useCurrentTableCellEditMode();

  const [isHovered, setIsHovered] = useState(false);

  const hasSoftFocus = useIsSoftFocusOnCurrentTableCell();

  const setSoftFocusOnCurrentTableCell = useSetSoftFocusOnCurrentTableCell();
  const { getIsSomeCellInEditMode } = useSomeCellInEditMode();

  const { openTableCell, closeTableCell } = useTableCell();

  const handleButtonClick = () => {
    setSoftFocusOnCurrentTableCell();
    openTableCell();
  };

  const handleContainerMouseEnter = async () => {
    const cellInEditMode = await getIsSomeCellInEditMode();
    if (!isHovered && !cellInEditMode) {
      setIsHovered(true);
      setSoftFocusOnCurrentTableCell();
    }
  };

  const handleContainerMouseLeave = async () => {
    const cellInEditMode = await getIsSomeCellInEditMode();
    if (!cellInEditMode) {
      setIsHovered(false);
      closeTableCell();
    }
  };

  const editModeContentOnly = useIsFieldInputOnly();

  const isFirstColumnCell = useContext(ColumnIndexContext) === 0;

  const isEmpty = useIsFieldEmpty();

  const showButton =
    !!buttonIcon &&
    hasSoftFocus &&
    !isCurrentTableCellInEditMode &&
    !editModeContentOnly &&
    (!isFirstColumnCell || !isEmpty);

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
            {showButton && (
              <TableCellButton onClick={handleButtonClick} Icon={buttonIcon} />
            )}
            <TableCellSoftFocusMode>
              {editModeContentOnly ? editModeContent : nonEditModeContent}
            </TableCellSoftFocusMode>
          </>
        ) : (
          <>
            {showButton && (
              <TableCellButton onClick={handleButtonClick} Icon={buttonIcon} />
            )}
            <TableCellDisplayMode>
              {editModeContentOnly ? editModeContent : nonEditModeContent}
            </TableCellDisplayMode>
          </>
        )}
      </StyledCellBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
};
