import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { isInsurOSAdminAccount } from '@/settings/integrations/utils/AdminAccounts';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const AppRouter = () => {
  // We want to disable serverless function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) &&
    isInsurOSAdminAccount(currentUser?.email ?? '');

  return (
    <RouterProvider
      router={useCreateAppRouter(isFunctionSettingsEnabled, isAdminPageEnabled)}
    />
  );
};
