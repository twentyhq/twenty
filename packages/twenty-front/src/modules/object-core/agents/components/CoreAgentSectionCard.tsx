import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;

  &[data-has-gap] {
    gap: ${themeCssVariables.spacing[1]};
  }
`;

type CoreAgentSectionCardProps = {
  children: ReactNode;
  hasGap?: boolean;
};

export const CoreAgentSectionCard = ({
  children,
  hasGap = false,
}: CoreAgentSectionCardProps) => (
  <StyledContainer data-has-gap={hasGap || undefined}>
    {children}
  </StyledContainer>
);
