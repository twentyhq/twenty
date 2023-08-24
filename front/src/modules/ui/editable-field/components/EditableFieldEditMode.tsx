import { useRef } from 'react';
import styled from '@emotion/styled';

import { useRegisterCloseFieldHandlers } from '../hooks/useRegisterCloseFieldHandlers';

const StyledEditableFieldEditModeContainer = styled.div<OwnProps>`
  align-items: center;

  display: flex;
  height: 24px;

  margin-left: -${({ theme }) => theme.spacing(1)};
  position: relative;
  width: 100%;
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
    <StyledEditableFieldEditModeContainer
      data-testid="editable-field-edit-mode-container"
      ref={wrapperRef}
    >
      {children}
    </StyledEditableFieldEditModeContainer>
  );
}
