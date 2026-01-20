import { PrefetchRunFavoriteQueriesEffect } from '@/prefetch/components/PrefetchRunFavoriteQueriesEffect';
import { PrefetchRunNavigationMenuItemQueriesEffect } from '@/prefetch/components/PrefetchRunNavigationMenuItemQueriesEffect';
import React from 'react';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunFavoriteQueriesEffect />
      <PrefetchRunNavigationMenuItemQueriesEffect />
      {children}
    </>
  );
};
