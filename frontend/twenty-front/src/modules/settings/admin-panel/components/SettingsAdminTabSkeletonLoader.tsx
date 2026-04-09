import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const SettingsAdminTabSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
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
