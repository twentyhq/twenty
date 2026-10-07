import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Skeleton, SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

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
      <StyledTitleSkeleton>
        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={4}
          width={72}
          height={SKELETON_HEIGHT_SIZES.xs}
          highlightColor={themeCssVariables.background.transparent.light}
        />
      </StyledTitleSkeleton>
      <StyledRowsContainer>
        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={4}
          containerClassName={fillSkeletonContainer}
          height={SKELETON_HEIGHT_SIZES.s}
          highlightColor={themeCssVariables.background.transparent.light}
        />
        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={4}
          containerClassName={fillSkeletonContainer}
          height={SKELETON_HEIGHT_SIZES.s}
          highlightColor={themeCssVariables.background.transparent.light}
        />
        <Skeleton
          layout="line"
          baseColor={themeCssVariables.background.tertiary}
          borderRadius={4}
          containerClassName={fillSkeletonContainer}
          height={SKELETON_HEIGHT_SIZES.s}
          highlightColor={themeCssVariables.background.transparent.light}
        />
      </StyledRowsContainer>
    </NavigationDrawerSection>
  );
};
