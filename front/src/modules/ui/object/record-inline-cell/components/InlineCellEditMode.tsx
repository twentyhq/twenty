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
  display: flex;
  margin-left: -1px;

  min-height: 32px;
  min-width: 200px;
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
