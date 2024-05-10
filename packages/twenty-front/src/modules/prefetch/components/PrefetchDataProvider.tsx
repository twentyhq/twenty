import React from 'react';

import { PrefetchRunQueriesEffect } from '@/prefetch/components/PrefetchRunQueriesEffect';

export const PrefetchContext = React.createContext({
  loading: true,
});

export const PrefetchDataProvider = ({ children }: React.PropsWithChildren) => {
  const [loading, setLoading] = React.useState(false);
  return (
    <PrefetchContext.Provider value={{ loading }}>
      <PrefetchRunQueriesEffect setLoading={setLoading} />
      {children}
    </PrefetchContext.Provider>
  );
};
