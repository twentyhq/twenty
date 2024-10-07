import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const StyledSkeletonColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 76px;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

export const NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader: React.FC =
  () => {
    const theme = useTheme();
    return (
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.light}
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
