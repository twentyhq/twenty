import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCard = styled(Card)`
  background-color: ${themeCssVariables.background.secondary};
  height: 40px;
`;

export { StyledCard as SettingsListSkeletonCard };
