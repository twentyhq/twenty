import { styled } from '@linaria/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import {
  themeCssVariables,
  resolveThemeVariable,
} from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationDetailSkeletonLoader = () => {
  return (
    <SkeletonTheme
      baseColor={resolveThemeVariable(themeCssVariables.background.tertiary)}
      highlightColor={resolveThemeVariable(
        themeCssVariables.background.transparent.lighter,
      )}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        <StyledFormSection>
          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
            width="100%"
          />

          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
            width="100%"
          />

          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
            width="100%"
          />

          <Skeleton
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
            width="100%"
          />
        </StyledFormSection>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
