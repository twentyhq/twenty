import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSaveButtonContainer = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export { StyledSaveButtonContainer as ViewPickerSaveButtonContainer };
