import { type ReactNode, useMemo } from 'react';
import { type DataRouter } from 'react-router-dom';

import {
  type AppNavigator,
  AppNavigatorContext,
} from '@/app/contexts/AppNavigatorContext';

type AppNavigatorProviderProps = {
  router: DataRouter;
  children: ReactNode;
};

export const AppNavigatorProvider = ({
  router,
  children,
}: AppNavigatorProviderProps) => {
  const appNavigator = useMemo<AppNavigator>(
    () => ({
      push: (to, state) => router.navigate(to, { state }),
      replace: (to, state) => router.navigate(to, { replace: true, state }),
    }),
    [router],
  );

  return (
    <AppNavigatorContext.Provider value={appNavigator}>
      {children}
    </AppNavigatorContext.Provider>
  );
};
