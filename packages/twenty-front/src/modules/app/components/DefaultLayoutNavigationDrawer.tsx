import { AppNavigationDrawer } from '@/navigation/components/AppNavigationDrawer';
import { useShowFullscreen } from '@/ui/layout/fullscreen/hooks/useShowFullscreen';
import { styled } from '@linaria/react';

const StyledNavigationDrawerWrapper = styled.div`
  flex-shrink: 0;

  @media print {
    display: none;
  }
`;

export const DefaultLayoutNavigationDrawer = () => {
  const showFullscreen = useShowFullscreen();

  if (showFullscreen) {
    return null;
  }

  return (
    <StyledNavigationDrawerWrapper>
      <AppNavigationDrawer />
    </StyledNavigationDrawerWrapper>
  );
};
