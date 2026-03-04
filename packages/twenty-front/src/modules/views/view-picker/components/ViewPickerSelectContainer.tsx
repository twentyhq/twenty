import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSelectContainer = styled.div`
  display: flex;
  width: calc(100% - ${themeCssVariables.spacing[2]});
  margin: ${themeCssVariables.spacing[1]};
  color: ${themeCssVariables.font.color.light};
  user-select: none;
`;

export { StyledSelectContainer as ViewPickerSelectContainer };
