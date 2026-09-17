import { styled } from '@linaria/react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;
