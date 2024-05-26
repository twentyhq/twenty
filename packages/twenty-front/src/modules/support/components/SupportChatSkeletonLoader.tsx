import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';

export const SupportChatSkeletonLoader = () => {
  const theme = useTheme();
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={84} height={24} />
    </SkeletonTheme>
  );
};
