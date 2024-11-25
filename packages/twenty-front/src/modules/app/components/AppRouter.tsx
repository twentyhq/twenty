import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { billingState } from '@/client-config/states/billingState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

export const AppRouter = () => {
  const billing = useRecoilValue(billingState);
  const isFreeAccessEnabled = useIsFeatureEnabled('IS_FREE_ACCESS_ENABLED');
  const isCRMMigrationEnabled = useIsFeatureEnabled('IS_CRM_MIGRATION_ENABLED');
  const isSSOEnabled = useIsFeatureEnabled('IS_SSO_ENABLED');
  const isServerlessFunctionSettingsEnabled = useIsFeatureEnabled(
    'IS_FUNCTION_SETTINGS_ENABLED',
  );

  const isBillingPageEnabled =
    billing?.isBillingEnabled && !isFreeAccessEnabled;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled = currentUser?.canImpersonate;

  return (
    <RouterProvider
      router={useCreateAppRouter(
        isBillingPageEnabled,
        isCRMMigrationEnabled,
        isServerlessFunctionSettingsEnabled,
        isSSOEnabled,
        isAdminPageEnabled,
      )}
    />
  );
};
