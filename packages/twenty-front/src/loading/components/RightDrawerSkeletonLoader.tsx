import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';

const StyledRightDrawerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSkeletonLoader = () => {
  return (
    <SkeletonTheme
      baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
      highlightColor={resolveThemeVariable(
        themeCssVariables.background.transparent.lighter,
      )}
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
