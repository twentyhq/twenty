import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AppRouter = () => {
  const billing = useRecoilValue(billingState);

  // We want to disable serverless function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const isBillingPageEnabled = billing?.isBillingEnabled;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled = currentUser?.canImpersonate;

  const isPermissionsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsEnabled,
  );

  return (
    <RouterProvider
      router={useCreateAppRouter(
        isBillingPageEnabled,
        isFunctionSettingsEnabled,
        isAdminPageEnabled,
        isPermissionsEnabled,
      )}
    />
  );
};
