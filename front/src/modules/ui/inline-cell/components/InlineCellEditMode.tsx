import styled from '@emotion/styled';

const StyledInlineCellEditModeContainer = styled.div<InlineCellEditModeProps>`
  align-items: center;

  display: flex;
  height: 24px;

  margin-left: -${({ theme }) => theme.spacing(1)};
  position: relative;
  z-index: 10;
`;

const StyledInlineCellInput = styled.div`
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

type InlineCellEditModeProps = {
  children: React.ReactNode;
};

export const InlineCellEditMode = ({ children }: InlineCellEditModeProps) => (
  <StyledInlineCellEditModeContainer data-testid="inline-cell-edit-mode-container">
    <StyledInlineCellInput>{children}</StyledInlineCellInput>
  </StyledInlineCellEditModeContainer>
);
