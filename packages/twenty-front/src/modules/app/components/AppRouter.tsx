import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const AppRouter = () => {
  const billing = useRecoilValue(billingState);
  const isFreeAccessEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsFreeAccessEnabled,
  );
  const isServerlessFunctionSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsFunctionSettingsEnabled,
  );

  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled = currentUser?.canImpersonate;

  return (
    <RouterProvider
      router={useCreateAppRouter(
        isBillingPageEnabled,
        isServerlessFunctionSettingsEnabled,
        isAdminPageEnabled,
      )}
    />
  );
};
