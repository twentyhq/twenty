import { type ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type AppNavigator,
  AppNavigatorContext,
} from '@/app/contexts/AppNavigatorContext';

export const MemoryRouterAppNavigatorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const navigate = useNavigate();

  const appNavigator = useMemo<AppNavigator>(
    () => ({
      push: (to, state) => navigate(to, { state }),
      replace: (to, state) => navigate(to, { replace: true, state }),
    }),
    [navigate],
  );

  return (
    <AppNavigatorContext.Provider value={appNavigator}>
      {children}
    </AppNavigatorContext.Provider>
  );
};
