import { ReactElement, useRef } from 'react';
import styled from '@emotion/styled';

import { overlayBackground } from '@/ui/themes/effects';

import { useRegisterCloseCellHandlers } from './hooks/useRegisterCloseCellHandlers';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  margin-left: -1px;
  margin-top: -1px;

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
  onCancel?: () => void;
  onSubmit?: () => void;
};

export function EditableCellEditMode({
  editModeHorizontalAlign,
  editModeVerticalPosition,
  children,
  onCancel,
  onSubmit,
}: OwnProps) {
  const wrapperRef = useRef(null);

  useRegisterCloseCellHandlers(wrapperRef, onSubmit, onCancel);

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
