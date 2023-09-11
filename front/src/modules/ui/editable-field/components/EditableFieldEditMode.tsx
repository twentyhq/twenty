import styled from '@emotion/styled';

import { overlayBackground } from '@/ui/theme/constants/effects';

const StyledEditableFieldEditModeContainer = styled.div<OwnProps>`
  align-items: center;

  display: flex;
  height: 24px;

  margin-left: -${({ theme }) => theme.spacing(1)};
  position: relative;
  z-index: 10;
`;

const StyledEditableFieldInput = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  margin-left: -1px;
  min-height: 32px;
  width: inherit;

  ${overlayBackground}

  z-index: 10;
`;

type OwnProps = {
  children: React.ReactNode;
};

export function EditableFieldEditMode({ children }: OwnProps) {
  return (
    <StyledEditableFieldEditModeContainer data-testid="editable-field-edit-mode-container">
      <StyledEditableFieldInput>{children}</StyledEditableFieldInput>
    </StyledEditableFieldEditModeContainer>
  );
}
