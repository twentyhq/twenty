import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledLogConsoleFieldsCard = styled(Card.Root)`
  --card-background-color: ${themeCssVariables.background.secondary};

  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;
