import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRightDrawerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} width={140} />
    </SkeletonTheme>
  );
};

export const RightDrawerSkeletonLoader = () => {
  return (
    <StyledRightDrawerContainer>
      <StyledSkeletonLoader />
    </StyledRightDrawerContainer>
  );
};
