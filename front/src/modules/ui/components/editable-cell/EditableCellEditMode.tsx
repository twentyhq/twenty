import { ReactElement, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';

import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { overlayBackground } from '@/ui/themes/effects';

import { useEditableCell } from './hooks/useCloseEditableCell';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  margin-left: -2px;
  min-height: 100%;
  min-width: calc(100% + 20px);
  position: absolute;

  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};
  z-index: 1;
  ${overlayBackground}
`;

type OwnProps = {
  children: ReactElement;
  editModeHorizontalAlign?: 'left' | 'right';
  editModeVerticalPosition?: 'over' | 'below';
  onOutsideClick?: () => void;
};

export function EditableCellEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
  onOutsideClick,
}: OwnProps) {
  const wrapperRef = useRef(null);

  const { closeEditableCell } = useEditableCell();
  const { moveRight, moveLeft } = useMoveSoftFocus();

  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    onOutsideClick?.();
  });

  useHotkeys(
    'esc',
    () => {
      closeEditableCell();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeEditableCell],
  );

  useHotkeys(
    'tab',
    () => {
      closeEditableCell();
      moveRight();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeEditableCell, moveRight],
  );

  useHotkeys(
    'shift+tab',
    () => {
      closeEditableCell();
      moveLeft();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeEditableCell, moveRight],
  );

  return (
    <EditableCellEditModeContainer
      data-testid="editable-cell-edit-mode-container"
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {children}
    </EditableCellEditModeContainer>
  );
}
