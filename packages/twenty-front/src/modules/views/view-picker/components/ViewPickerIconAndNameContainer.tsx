import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${themeCssVariables.spacing[1]};
  margin-right: ${themeCssVariables.spacing[1]};
  gap: ${themeCssVariables.spacing[1]};
`;

export { StyledIconAndNameContainer as ViewPickerIconAndNameContainer };
