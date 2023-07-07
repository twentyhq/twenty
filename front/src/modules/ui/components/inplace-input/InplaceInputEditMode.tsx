import { ReactElement, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from '@emotion/styled';

import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { useMoveSoftFocus } from '@/ui/tables/hooks/useMoveSoftFocus';
import { overlayBackground } from '@/ui/themes/effects';

import { useInplaceInput } from './hooks/useCloseInplaceInput';

export const InplaceInputEditModeContainer = styled.div<OwnProps>`
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

export function InplaceInputEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
  onOutsideClick,
}: OwnProps) {
  const wrapperRef = useRef(null);

  const { closeInplaceInput } = useInplaceInput();
  const { moveRight, moveLeft, moveDown } = useMoveSoftFocus();

  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    onOutsideClick?.();
  });

  useHotkeys(
    'enter',
    () => {
      closeInplaceInput();
      moveDown();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeInplaceInput],
  );

  useHotkeys(
    'esc',
    () => {
      closeInplaceInput();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeInplaceInput],
  );

  useHotkeys(
    'tab',
    () => {
      closeInplaceInput();
      moveRight();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeInplaceInput, moveRight],
  );

  useHotkeys(
    'shift+tab',
    () => {
      closeInplaceInput();
      moveLeft();
    },
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [closeInplaceInput, moveRight],
  );

  return (
    <InplaceInputEditModeContainer
      data-testid="inplace-input-edit-mode-container"
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {children}
    </InplaceInputEditModeContainer>
  );
}
