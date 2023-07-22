import { ReactElement, useRef } from 'react';
import styled from '@emotion/styled';

import { overlayBackground } from '@/ui/themes/effects';

import { useRegisterCloseCellHandlers } from '../hooks/useRegisterCloseCellHandlers';

export const EditableCellEditModeContainer = styled.div<OwnProps>`
  align-items: center;
  border: ${({ transparent, theme }) =>
    transparent ? 'none' : `1px solid ${theme.border.color.light}`};
  border-radius: ${({ transparent, theme }) =>
    transparent ? 'none' : theme.border.radius.sm};
  display: flex;
  left: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? 'auto' : '0'};
  margin-left: -1px;
  margin-top: -1px;

  max-width: ${({ maxContentWidth }) =>
    maxContentWidth ? `${maxContentWidth}px` : 'auto'};
  min-height: 100%;
  min-width: 100%;

  position: absolute;
  right: ${(props) =>
    props.editModeHorizontalAlign === 'right' ? '0' : 'auto'};
  top: ${(props) => (props.editModeVerticalPosition === 'over' ? '0' : '100%')};
  ${({ transparent }) => (transparent ? '' : overlayBackground)};
  z-index: 1;
`;

type OwnProps = {
  children: ReactElement;
  transparent?: boolean;
  maxContentWidth?: number;
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
  transparent = false,
  maxContentWidth,
}: OwnProps) {
  const wrapperRef = useRef(null);

  useRegisterCloseCellHandlers(wrapperRef, onSubmit, onCancel);

  return (
    <EditableCellEditModeContainer
      maxContentWidth={maxContentWidth}
      transparent={transparent}
      data-testid="editable-cell-edit-mode-container"
      ref={wrapperRef}
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeVerticalPosition={editModeVerticalPosition}
    >
      {children}
    </EditableCellEditModeContainer>
  );
}
