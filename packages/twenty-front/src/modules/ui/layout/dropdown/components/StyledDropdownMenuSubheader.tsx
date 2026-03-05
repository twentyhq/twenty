import { styled } from '@linaria/react';
import React from 'react';
import { Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSubheaderContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

export const StyledDropdownMenuSubheader = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StyledDropdownMenuSubheaderContainer>
    <Label>{children}</Label>
  </StyledDropdownMenuSubheaderContainer>
);
