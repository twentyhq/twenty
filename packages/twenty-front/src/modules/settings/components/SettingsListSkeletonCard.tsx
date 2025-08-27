import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/layout';

const StyledCard = styled(Card)`
  background-color: ${({ theme }) => theme.background.secondary};
  height: 40px;
`;

export { StyledCard as SettingsListSkeletonCard };
