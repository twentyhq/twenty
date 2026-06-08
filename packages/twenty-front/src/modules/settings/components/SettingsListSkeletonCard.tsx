import { styled } from '@linaria/react';
import { Card } from 'twenty-ui-deprecated/layout';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledCardContainer = styled.div`
  height: 40px;

  > * {
    background-color: ${themeCssVariables.background.secondary};
    height: 100%;
  }
`;

export const SettingsListSkeletonCard = () => (
  <StyledCardContainer>
    <Card />
  </StyledCardContainer>
);
