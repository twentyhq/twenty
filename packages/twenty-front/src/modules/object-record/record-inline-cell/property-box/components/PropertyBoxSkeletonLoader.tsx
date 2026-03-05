import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledSkeletonDiv = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
  height: 24px;
`;
export const PropertyBoxSkeletonLoader = () => {
  const skeletonItems = Array.from({ length: 4 }).map((_, index) => ({
    id: `skeleton-item-${index}`,
  }));
  return (
    <SkeletonTheme
      baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
      highlightColor={resolveThemeVariable(
        themeCssVariables.background.transparent.lighter,
      )}
      borderRadius={4}
    >
      {skeletonItems.map(({ id }) => (
        <StyledSkeletonDiv key={id}>
          <Skeleton
            width={92}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={154}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonDiv>
      ))}
    </SkeletonTheme>
  );
};
