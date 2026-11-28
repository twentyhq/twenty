import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldsCard = styled(Card.Root)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

type DetailFieldsCardProps = {
  children: ReactNode;
};

export const DetailFieldsCard = ({ children }: DetailFieldsCardProps) => (
  <StyledFieldsCard backgroundColor={themeCssVariables.background.secondary}>
    {children}
  </StyledFieldsCard>
);
