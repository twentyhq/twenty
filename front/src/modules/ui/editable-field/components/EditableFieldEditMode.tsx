import { useRef } from 'react';
import styled from '@emotion/styled';

import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';

export const EditableFieldEditModeContainer = styled.div<OwnProps>`
  align-items: center;

  display: flex;

  margin-left: -${({ theme }) => theme.spacing(1)};

  width: inherit;
  z-index: 10;
`;

type OwnProps = {
  children: React.ReactNode;
  onOutsideClick?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
};

export function EditableFieldEditMode({
  children,
  onCancel,
  onSubmit,
}: OwnProps) {
  const wrapperRef = useRef(null);

  useRegisterCloseFieldHandlers(wrapperRef, onSubmit, onCancel);

  return (
    <EditableFieldEditModeContainer
      data-testid="editable-field-edit-mode-container"
      ref={wrapperRef}
    >
      {children}
    </EditableFieldEditModeContainer>
  );
}
