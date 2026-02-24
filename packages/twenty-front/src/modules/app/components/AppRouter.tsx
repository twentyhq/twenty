import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { RouterProvider } from 'react-router-dom';

export const AppRouter = () => {
  // We want to disable logic function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const currentUser = useAtomValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  return (
    <RouterProvider
      router={useCreateAppRouter(isFunctionSettingsEnabled, isAdminPageEnabled)}
    />
  );
};
