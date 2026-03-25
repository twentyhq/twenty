import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.extraLight};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

export { StyledTitle as SettingsDataModelCardTitle };
