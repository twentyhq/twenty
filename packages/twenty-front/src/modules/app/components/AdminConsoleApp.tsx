import { RouterProvider } from 'react-router-dom';

import { AppNavigatorProvider } from '@/app/components/AppNavigatorProvider';
import { useCreateAdminConsoleAppRouter } from '@/app/hooks/useCreateAdminConsoleAppRouter';
import { handleRouterError } from '@/error-handler/utils/handleRouterError';

export const AdminConsoleApp = () => {
  const router = useCreateAdminConsoleAppRouter();

  return (
    <AppNavigatorProvider router={router}>
      <RouterProvider
        useTransitions={false}
        router={router}
        onError={handleRouterError}
      />
    </AppNavigatorProvider>
  );
};
