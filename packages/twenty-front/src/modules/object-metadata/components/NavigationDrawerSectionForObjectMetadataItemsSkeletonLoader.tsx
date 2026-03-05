import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 76px;
  padding-left: ${themeCssVariables.spacing[1]};
`;

export const NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader: React.FC =
  () => {
    return (
      <SkeletonTheme
        baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
        highlightColor={resolveThemeVariable(
          themeCssVariables.background.transparent.light,
        )}
        borderRadius={4}
      >
        <StyledSkeletonColumn>
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonColumn>
      </SkeletonTheme>
    );
  };
