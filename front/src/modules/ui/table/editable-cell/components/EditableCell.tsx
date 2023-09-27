import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentCellEditMode } from '../hooks/useCurrentCellEditMode';
import { useEditableCell } from '../hooks/useEditableCell';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayMode } from './EditableCellDisplayMode';
import { EditableCellEditButton } from './EditableCellEditButton';
import { EditableCellEditMode } from './EditableCellEditMode';
import { EditableCellSoftFocusMode } from './EditableCellSoftFocusMode';

const StyledCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  margin: -1px;
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

export const EditableCell = ({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
  transparent = false,
  maxContentWidth,
  useEditButton,
}: EditableCellProps) => {
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();
  const [isHovered, setIsHovered] = useState(false);

  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  const handlePenClick = () => {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  };

  const handleContainerMouseEnter = () => {
    setIsHovered(true);
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const showEditButton = useEditButton && isHovered && !isCurrentCellInEditMode;

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  return (
    <CellHotkeyScopeContext.Provider
      value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
    >
      <StyledCellBaseContainer
        onMouseEnter={handleContainerMouseEnter}
        onMouseLeave={handleContainerMouseLeave}
      >
        {isCurrentCellInEditMode ? (
          <EditableCellEditMode
            maxContentWidth={maxContentWidth}
            transparent={transparent}
            editModeHorizontalAlign={editModeHorizontalAlign}
            editModeVerticalPosition={editModeVerticalPosition}
          >
            {editModeContent}
          </EditableCellEditMode>
        ) : hasSoftFocus ? (
          <>
            {showEditButton && (
              <EditableCellEditButton onClick={handlePenClick} />
            )}
            <EditableCellSoftFocusMode>
              {nonEditModeContent}
            </EditableCellSoftFocusMode>
          </>
        ) : (
          <>
            {showEditButton && (
              <EditableCellEditButton onClick={handlePenClick} />
            )}
            <EditableCellDisplayMode isHovered={isHovered}>
              {nonEditModeContent}
            </EditableCellDisplayMode>
          </>
        )}
      </StyledCellBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
};
