import { styled } from '@linaria/react';
import { Label } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledDropdownMenuSubheader = styled(Label)`
  background-color: ${themeCssVariables.background.transparent.lighter};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;
