import { ReactElement, useState } from 'react';
import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';
import { motion } from 'framer-motion';

import { IconButton } from '@/ui/button/components/IconButton';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { CellHotkeyScopeContext } from '../../states/CellHotkeyScopeContext';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';
import { useCurrentCellEditMode } from '../hooks/useCurrentCellEditMode';
import { useIsSoftFocusOnCurrentCell } from '../hooks/useIsSoftFocusOnCurrentCell';

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
}: OwnProps) {
  const { isCurrentCellInEditMode, setCurrentCellInEditMode } =
    useCurrentCellEditMode();
  const [isHovered, setIsHovered] = useState(false);

  function isValidUrl(value: string) {
    let testUrl = value;
    if (testUrl && !testUrl.startsWith('http')) {
      testUrl = 'http://' + testUrl;
    }
    try {
      new URL(testUrl);
      return true;
    } catch (err) {
      return false;
    }
  }

  const handleClick = () => {
    setCurrentCellInEditMode();
  };

  function handleContainerMouseEnter() {
    setIsHovered(true);
  }

  function handleContainerMouseLeave() {
    setIsHovered(false);
  }

  const value = nonEditModeContent.props.value;
  const showEditButton =
    !isCurrentCellInEditMode && isValidUrl(value) && isHovered;

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
                  onClick={handleClick}
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
