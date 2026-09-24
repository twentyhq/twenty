import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledDropdownMenuSubheaderContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const StyledDropdownMenuSubheader = ({
  children,
}: {
  children: ReactNode;
}) => (
  <StyledDropdownMenuSubheaderContainer>
    <StyledDisplayLabel>{children}</StyledDisplayLabel>
  </StyledDropdownMenuSubheaderContainer>
);

const StyledDisplayLabel = styled(Text)`
  color: var(--t-font-color-light);
  font-size: 11px;
  font-weight: var(--t-font-weight-semi-bold);
`;
