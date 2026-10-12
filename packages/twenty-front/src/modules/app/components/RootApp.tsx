import { RouterProvider } from 'react-router-dom';

import { AppNavigatorProvider } from '@/app/components/AppNavigatorProvider';
import { useCreateRootAppRouter } from '@/app/hooks/useCreateRootAppRouter';

export const RootApp = () => {
  const router = useCreateRootAppRouter();

  return (
    <AppNavigatorProvider router={router}>
      <RouterProvider router={router} useTransitions={false} />
    </AppNavigatorProvider>
  );
};
