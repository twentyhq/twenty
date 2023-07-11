import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { HotkeysScope } from '@/hotkeys/types/internal/HotkeysScope';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';

import { useCurrentCellEditMode } from './hooks/useCurrentCellEditMode';
import { useEditableCell } from './hooks/useEditableCell';
import { useIsSoftFocusOnCurrentCell } from './hooks/useIsSoftFocusOnCurrentCell';
import { useSetSoftFocusOnCurrentCell } from './hooks/useSetSoftFocusOnCurrentCell';
import { EditableCellDisplayMode } from './EditableCellDisplayMode';
import { EditableCellEditMode } from './EditableCellEditMode';
import { EditableCellSoftFocusMode } from './EditableCellSoftFocusMode';

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
  editHotkeysScope?: HotkeysScope;
};

export function EditableCell({
  editModeHorizontalAlign = 'left',
  editModeVerticalPosition = 'over',
  editModeContent,
  nonEditModeContent,
  editHotkeysScope,
}: OwnProps) {
  console.log('EditableCell');
  const { isCurrentCellInEditMode } = useCurrentCellEditMode();

  const hasSoftFocus = useIsSoftFocusOnCurrentCell();

  return (
    <CellBaseContainer>
      {isCurrentCellInEditMode ? (
        <EditableCellEditMode
          editModeHorizontalAlign={editModeHorizontalAlign}
          editModeVerticalPosition={editModeVerticalPosition}
        >
          {editModeContent}
        </EditableCellEditMode>
      ) : hasSoftFocus ? (
        <EditableCellSoftFocusMode editHotkeysScope={editHotkeysScope}>
          {nonEditModeContent}
        </EditableCellSoftFocusMode>
      ) : (
        <EditableCellDisplayMode>{nonEditModeContent}</EditableCellDisplayMode>
      )}
    </CellBaseContainer>
  );
}
