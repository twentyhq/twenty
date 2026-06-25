import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTitleSkeleton = styled.div`
  align-items: center;
  display: flex;
  height: ${themeCssVariables.spacing[5]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing['0.5']};
`;

const StyledRowsContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const fillSkeletonContainer = css`
  display: block;
  width: 100%;
`;

export const NavigationDrawerWorkspaceSectionSkeletonLoader = () => {
  return (
    <NavigationDrawerSection>
      <SkeletonTheme
        baseColor={themeCssVariables.background.tertiary}
        highlightColor={themeCssVariables.background.transparent.light}
        borderRadius={4}
      >
        <StyledTitleSkeleton>
          <Skeleton
            width={72}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
          />
        </StyledTitleSkeleton>
        <StyledRowsContainer>
          <Skeleton
            containerClassName={fillSkeletonContainer}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            containerClassName={fillSkeletonContainer}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            containerClassName={fillSkeletonContainer}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledRowsContainer>
      </SkeletonTheme>
    </NavigationDrawerSection>
  );
};
