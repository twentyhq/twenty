import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonContainer = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 71px;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledSkeletonColumn = styled.div<{
  isMobile?: boolean;
}>`
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const FavoritesSkeletonLoader = () => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer isMobile={isMobile}>
        <Skeleton
          width={56}
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.xs}
        />
        <StyledSkeletonColumn>
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
          <Skeleton
            width={196}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
          />
        </StyledSkeletonColumn>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
