import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import StripeProvider from '~/pages/settings/integrations/stripe/context/StripeContext';

export const AppRouter = () => {
  // We want to disable serverless function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  return (
    <StripeProvider>
      <RouterProvider
        router={useCreateAppRouter(
          isFunctionSettingsEnabled,
          isAdminPageEnabled,
        )}
      />
    </StripeProvider>
  );
};
