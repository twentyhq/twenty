import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-inline-start: ${themeCssVariables.spacing[1]};
  margin-inline-end: ${themeCssVariables.spacing[1]};
`;

export { StyledIconAndNameContainer as ViewPickerIconAndNameContainer };
