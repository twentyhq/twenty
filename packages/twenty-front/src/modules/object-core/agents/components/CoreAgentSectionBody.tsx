import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledSectionBody = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type CoreAgentSectionBodyProps = {
  children: ReactNode;
};

export const CoreAgentSectionBody = ({
  children,
}: CoreAgentSectionBodyProps) => (
  <StyledSectionBody>{children}</StyledSectionBody>
);
