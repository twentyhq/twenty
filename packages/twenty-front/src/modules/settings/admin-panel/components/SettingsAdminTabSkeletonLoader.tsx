import { useTheme } from '@emotion/react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';

export const SettingsAdminTabSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton height={SKELETON_LOADER_HEIGHT_SIZES.standard.m} width={120} />
    </SkeletonTheme>
  );
};
