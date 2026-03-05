import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonCardContainer = styled.div`
  > div {
    background-color: ${themeCssVariables.background.secondary};
    height: 40px;
  }
`;

export const SettingsListSkeletonCard = () => (
  <StyledSkeletonCardContainer>
    <Card />
  </StyledSkeletonCardContainer>
);
