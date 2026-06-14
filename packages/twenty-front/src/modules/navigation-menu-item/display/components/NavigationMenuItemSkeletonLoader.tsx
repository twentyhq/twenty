import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui-deprecated/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 71px;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const fillSkeletonContainer = css`
  display: block;
  width: 100%;
`;

export const NavigationMenuItemSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.grayScale.gray3}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <Skeleton
          width={56}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
        />
        <StyledSkeletonColumn>
          <Skeleton
            containerClassName={fillSkeletonContainer}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            containerClassName={fillSkeletonContainer}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonColumn>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
