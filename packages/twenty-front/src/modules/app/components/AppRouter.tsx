import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const AppRouter = () => {
  const billing = useRecoilValue(billingState);

  // We want to disable serverless function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const isBillingPageEnabled = billing?.isBillingEnabled;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled = currentUser?.canImpersonate;

  return (
    <RouterProvider
      router={useCreateAppRouter(
        isBillingPageEnabled,
        isFunctionSettingsEnabled,
        isAdminPageEnabled,
      )}
    />
  );
};
