import { RouterProvider } from 'react-router-dom';

import { useCreateWorkspaceAppRouter } from '@/app/hooks/useCreateWorkspaceAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const WorkspaceApp = () => {
  const currentUser = useAtomStateValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  return (
    <RouterProvider
      useTransitions={false}
      router={useCreateWorkspaceAppRouter({ isAdminPageEnabled })}
    />
  );
};
