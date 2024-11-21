import React from 'react';

import { PrefetchFavoriteFoldersRunQueriesEffect } from '@/prefetch/components/PrefetchFavortiteFoldersRunQueriesEffect';
import { PrefetchRunQueriesEffect } from '@/prefetch/components/PrefetchRunQueriesEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  const isFavoriteFolderEnabled = useIsFeatureEnabled(
    'IS_FAVORITE_FOLDER_ENABLED',
  );
  return (
    <>
      <PrefetchRunQueriesEffect />
      {isFavoriteFolderEnabled && <PrefetchFavoriteFoldersRunQueriesEffect />}
      {children}
    </>
  );
};
