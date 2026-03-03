import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSeparator = styled.div`
  background-color: ${themeCssVariables.border.color.light};
  min-height: 1px;
  width: 100%;
`;

export const DropdownMenuSeparator = StyledDropdownMenuSeparator;
