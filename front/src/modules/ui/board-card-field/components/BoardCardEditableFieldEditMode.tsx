import { ReactElement, useRef } from 'react';
import styled from '@emotion/styled';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { useListenClickOutsideArrayOfRef } from '@/ui/hooks/useListenClickOutsideArrayOfRef';
import { overlayBackground } from '@/ui/themes/effects';

import { useBoardCardField } from '../hooks/useBoardCardField';

export const BoardCardFieldEditModeContainer = styled.div<OwnProps>`
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

export function BoardCardEditableFieldEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
}: OwnProps) {
  const wrapperRef = useRef(null);

  const { closeBoardCardField } = useBoardCardField();

  useListenClickOutsideArrayOfRef([wrapperRef], () => {
    closeBoardCardField();
  });

  useScopedHotkeys(
    'enter',
    () => {
      closeBoardCardField();
    },
    InternalHotkeysScope.BoardCardFieldEditMode,
    [closeBoardCardField],
  );

  useScopedHotkeys(
    'esc',
    () => {
      closeBoardCardField();
    },
    InternalHotkeysScope.BoardCardFieldEditMode,
    [closeBoardCardField],
  );

  return (
    <BoardCardFieldEditModeContainer
      data-testid="editable-cell-edit-mode-container"
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {children}
    </BoardCardFieldEditModeContainer>
  );
}
