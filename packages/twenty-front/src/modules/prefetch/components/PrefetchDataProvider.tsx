import React from 'react';

import { PrefetchRunQueriesEffect } from '@/prefetch/components/PrefetchRunQueriesEffect';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunQueriesEffect />
      {children}
    </>
  );
};
