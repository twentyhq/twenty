import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  align-items: flex-start;

  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 196px;
  max-width: 196px;
`;

export const MainNavigationDrawerItemsSkeletonLoader = ({
  title,
  length,
}: {
  title?: boolean;
  length: number;
}) => {
  return (
    <StyledSkeletonContainer>
      <SkeletonTheme
        baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
        highlightColor={resolveThemeVariable(
          themeCssVariables.background.transparent.lighter,
        )}
        borderRadius={4}
      >
        {title && (
          <Skeleton
            width={48}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
          />
        )}
        {Array.from({ length }).map((_, index) => (
          <Skeleton
            key={index}
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        ))}
      </SkeletonTheme>
    </StyledSkeletonContainer>
  );
};
