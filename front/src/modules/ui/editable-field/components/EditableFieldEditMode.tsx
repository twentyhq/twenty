import styled from '@emotion/styled';

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
  background: ${({ theme }) => theme.background.transparent.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;

  margin-left: -1px;
  min-height: 32px;
  width: inherit;

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
