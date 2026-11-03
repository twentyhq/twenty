import { isNonEmptyString } from '@sniptt/guards';
import { RouterProvider } from 'react-router-dom';

import { AppNavigatorProvider } from '@/app/components/AppNavigatorProvider';
import { useCreateWorkspaceAppRouter } from '@/app/hooks/useCreateWorkspaceAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { domainConfigurationState } from '@/domain-manager/states/domainConfigurationState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { handleRouterError } from '@/error-handler/utils/handleRouterError';

export const WorkspaceApp = () => {
  const currentUser = useAtomStateValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  const { adminConsoleUrl } = useAtomStateValue(domainConfigurationState);

  const router = useCreateWorkspaceAppRouter({
    isAdminPageEnabled,
    isAdminConsoleEnabled: isNonEmptyString(adminConsoleUrl),
  });

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
