import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const WidgetSkeletonLoader = () => {
  return (
    <StyledContainer>
      <SkeletonTheme
        baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
        highlightColor={resolveThemeVariable(
          themeCssVariables.background.transparent.lighter,
        )}
        borderRadius={4}
      >
        <Skeleton
          width={120}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
        />
      </SkeletonTheme>
    </StyledContainer>
  );
};
