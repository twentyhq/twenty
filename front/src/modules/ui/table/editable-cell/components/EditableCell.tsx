import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../contexts/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentCellEditMode } from '../hooks/useCurrentCellEditMode';
import { useEditableCell } from '../hooks/useEditableCell';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from '../hooks/useSetSoftFocusOnCurrentCell';

import { EditableCellDisplayMode } from './EditableCellDisplayMode';
import { EditableCellEditMode } from './EditableCellEditMode';
import { EditableCellSoftFocusMode } from './EditableCellSoftFocusMode';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

const StyledCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  width: 100%;
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

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeyScope,
  transparent = false,
  maxContentWidth,
  useEditButton,
}: EditableCellProps) {
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();
  const [isHovered, setIsHovered] = useState(false);

  const setSoftFocusOnCurrentCell = useSetSoftFocusOnCurrentCell();

  const { openEditableCell } = useEditableCell();

  function handlePenClick() {
    setSoftFocusOnCurrentCell();
    openEditableCell();
  }

  function handleContainerMouseEnter() {
    setIsHovered(true);
  }

  function handleContainerMouseLeave() {
    setIsHovered(false);
  }

  const showEditButton = useEditButton && isHovered && !isCurrentCellInEditMode;

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  function EditButton() {
    return (
      <StyledEditButtonContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
        whileHover={{ scale: 1.04 }}
      >
        <FloatingIconButton
          size="small"
          onClick={handlePenClick}
          Icon={IconPencil}
        />
      </StyledEditButtonContainer>
    );
  }

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
            {showEditButton && <EditButton />}
            <EditableCellSoftFocusMode>
              {nonEditModeContent}
            </EditableCellSoftFocusMode>
          </>
        ) : (
          <>
            {showEditButton && <EditButton />}
            <EditableCellDisplayMode>
              {nonEditModeContent}
            </EditableCellDisplayMode>
          </>
        )}
      </StyledCellBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
}
