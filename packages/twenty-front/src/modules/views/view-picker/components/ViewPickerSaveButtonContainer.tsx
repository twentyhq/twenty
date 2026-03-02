import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSaveButtonContainer = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
  width: calc(100% - ${themeCssVariables.spacing[2]});
`;

export { StyledSaveButtonContainer as ViewPickerSaveButtonContainer };
