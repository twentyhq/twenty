import { useMemo } from 'react';

import { createBrowserRouter } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { DefaultLayout } from '@/app/components/DefaultLayout';
import { MainAppLayoutWithSidePanel } from '@/app/components/MainAppLayoutWithSidePanel';
import { WorkspaceAppProviders } from '@/app/components/WorkspaceAppProviders';
import { WorkspaceRouteObjectsProvider } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { createAdminConsoleRouteObjects } from '@/app/routing/utils/createWorkspaceRouteObjects';
import { getWorkspaceRouteObjectsForSurface } from '@/app/routing/utils/getWorkspaceRouteObjectsForSurface';
import { AppRouteErrorFallback } from '@/error-handler/components/AppRouteErrorFallback';
import { MinimalMetadataGate } from '@/metadata-store/components/MinimalMetadataGate';
import { AdminConsoleSignIn } from '@/settings/admin-panel/admin-console/components/AdminConsoleSignIn';
import { AdminConsoleSignInRequired } from '@/settings/admin-panel/admin-console/components/AdminConsoleSignInRequired';
import { AuthFlowLayout } from '@/ui/layout/page/components/AuthFlowLayout';

const createAdminConsoleAppRouter = () => {
  const adminConsoleRouteObjects = createAdminConsoleRouteObjects();

  return createBrowserRouter([
    {
      element: (
        <WorkspaceRouteObjectsProvider
          routeObjects={adminConsoleRouteObjects}
        />
      ),
      errorElement: <AppRouteErrorFallback />,
      children: [
        {
          element: <WorkspaceAppProviders />,
          loader: async () => Promise.resolve(null),
          children: [
            {
              element: <MinimalMetadataGate />,
              children: [
                {
                  element: <DefaultLayout />,
                  children: [
                    {
                      element: <MainAppLayoutWithSidePanel />,
                      children: getWorkspaceRouteObjectsForSurface(
                        adminConsoleRouteObjects,
                        'main',
                      ),
                    },
                  ],
                },
              ],
            },
            {
              element: <AuthFlowLayout />,
              children: [
                { path: AppPath.Verify, element: <AdminConsoleSignIn /> },
                {
                  path: AppPath.SignInUp,
                  element: <AdminConsoleSignInRequired />,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);
};

export const useCreateAdminConsoleAppRouter = () =>
  useMemo(() => createAdminConsoleAppRouter(), []);
