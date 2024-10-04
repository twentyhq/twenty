import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export const SupportButtonSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={84} height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} />
    </SkeletonTheme>
  );
};
