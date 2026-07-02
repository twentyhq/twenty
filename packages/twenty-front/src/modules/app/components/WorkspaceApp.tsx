import { RouterProvider } from 'react-router-dom';

import { useCreateWorkspaceAppRouter } from '@/app/hooks/useCreateWorkspaceAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspaceApp = () => {
  const isFunctionSettingsEnabled = false;

  const currentUser = useAtomStateValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  return (
    <RouterProvider
      router={useCreateWorkspaceAppRouter(
        isFunctionSettingsEnabled,
        isAdminPageEnabled,
      )}
    />
  );
};
