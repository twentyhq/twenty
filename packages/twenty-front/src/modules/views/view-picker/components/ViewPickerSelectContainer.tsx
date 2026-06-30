import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSelectContainer = styled.div`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  margin: ${themeCssVariables.spacing[1]};
  user-select: none;
  width: calc(100% - ${themeCssVariables.spacing[2]});
`;

export { StyledSelectContainer as ViewPickerSelectContainer };
