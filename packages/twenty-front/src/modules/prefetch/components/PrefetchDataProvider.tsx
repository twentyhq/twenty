import { PrefetchRunFavoriteQueriesEffect } from '@/prefetch/components/PrefetchRunFavoriteQueriesEffect';
import { PrefetchRunViewQueryEffect } from '@/prefetch/components/PrefetchRunViewQueryEffect';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  const [searchParams] = useSearchParams();
  if (searchParams.get('disableDataLoad') === 'true') {
    return <>{children}</>;
  }
  return (
    <>
      <PrefetchRunFavoriteQueriesEffect />
      <PrefetchRunViewQueryEffect />
      {children}
    </>
  );
};
