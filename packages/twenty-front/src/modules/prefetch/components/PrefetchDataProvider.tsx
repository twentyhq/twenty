import { PrefetchRunNavigationMenuItemQueriesEffect } from '@/prefetch/components/PrefetchRunNavigationMenuItemQueriesEffect';
import React from 'react';

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <PrefetchRunNavigationMenuItemQueriesEffect />
      {children}
    </>
  );
};
