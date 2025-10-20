import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApplicationDetailSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
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
