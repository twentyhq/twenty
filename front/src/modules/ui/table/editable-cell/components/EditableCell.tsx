import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';
import { motion } from 'framer-motion';

import { IconButton } from '@/ui/button/components/IconButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../states/CellHotkeyScopeContext';
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

export const CellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  position: relative;
  user-select: none;
  width: 100%;
`;

type OwnProps = {
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
}: OwnProps) {
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

  return (
    <CellHotkeyScopeContext.Provider
      value={editHotkeyScope ?? DEFAULT_CELL_SCOPE}
    >
      <CellBaseContainer
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
          <EditableCellSoftFocusMode>
            {nonEditModeContent}
          </EditableCellSoftFocusMode>
        ) : (
          <>
            {showEditButton && (
              <StyledEditButtonContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                whileHover={{ scale: 1.04 }}
              >
                <IconButton
                  variant="shadow"
                  size="small"
                  onClick={handlePenClick}
                  icon={<IconPencil size={14} />}
                />
              </StyledEditButtonContainer>
            )}

            <EditableCellDisplayMode>
              {nonEditModeContent}
            </EditableCellDisplayMode>
          </>
        )}
      </CellBaseContainer>
    </CellHotkeyScopeContext.Provider>
  );
}
