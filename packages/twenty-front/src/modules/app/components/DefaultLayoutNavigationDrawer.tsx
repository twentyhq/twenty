import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { styled } from '@linaria/react';

const StyledNavigationDrawerWrapper = styled.div`
  flex-shrink: 0;

  @media print {
    display: none;
  }
`;

export const DefaultLayoutNavigationDrawer = () => (
  <StyledNavigationDrawerWrapper>
    <AppNavigationDrawer />
  </StyledNavigationDrawerWrapper>
);
