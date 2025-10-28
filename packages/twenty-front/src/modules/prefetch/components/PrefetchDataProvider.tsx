import { PrefetchRunFavoriteQueriesEffect } from '@/prefetch/components/PrefetchRunFavoriteQueriesEffect';
import React from 'react';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunFavoriteQueriesEffect />
      {children}
    </>
  );
};
