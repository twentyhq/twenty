import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledSkeletonLoader = () => {
  const theme = useTheme();
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

export const SidePanelSkeletonLoader = () => {
  return (
    <StyledSidePanelContainer>
      <StyledSkeletonLoader />
    </StyledSidePanelContainer>
  );
};
