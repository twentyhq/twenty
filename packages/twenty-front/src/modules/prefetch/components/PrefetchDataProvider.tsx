import { PrefetchRunQueriesEffect } from '@/prefetch/components/PrefetchRunQueriesEffect';
import React from 'react';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunQueriesEffect />
      {children}
    </>
  );
};
