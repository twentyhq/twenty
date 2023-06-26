import { ReactElement, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';

import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';

import { useListenClickOutsideArrayOfRef } from '../../hooks/useListenClickOutsideArrayOfRef';
import { overlayBackground } from '../../layout/styles/themes';

import { useEditableCell } from './hooks/useCloseEditableCell';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  align-items: center;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 4px;
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
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    onOutsideClick?.();
  });

  useHotkeys(
    'enter',
    () => {
      closeEditableCell();
      moveDown();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeEditableCell],
  );

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
