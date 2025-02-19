import { PrefetchRunFavoriteQueriesEffect } from '@/prefetch/components/PrefetchRunFavoriteQueriesEffect';
import { PrefetchRunViewQueryEffect } from '@/prefetch/components/PrefetchRunViewQueryEffect';
import React from 'react';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunFavoriteQueriesEffect />
      <PrefetchRunViewQueryEffect />
      {children}
    </>
  );
};
