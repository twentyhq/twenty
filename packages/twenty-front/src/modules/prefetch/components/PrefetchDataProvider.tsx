import { PrefetchRunFavoriteQueriesEffect } from '@/prefetch/components/PrefetchRunFavoriteQueriesEffect';
import { PrefetchRunViewQueryEffect } from '@/prefetch/components/PrefetchRunViewQueryEffect';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import React from 'react';
import { FeatureFlagKey } from '~/generated/graphql';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  const featureFlags = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlags[FeatureFlagKey.IS_CORE_VIEW_ENABLED];

  return (
    <>
      <PrefetchRunFavoriteQueriesEffect />
      {!isCoreViewEnabled && <PrefetchRunViewQueryEffect />}
      {children}
    </>
  );
};
