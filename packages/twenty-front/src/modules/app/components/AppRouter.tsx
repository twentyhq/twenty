import { useCreateAppRouter } from '@/app/hooks/useCreateAppRouter';
import { currentUserState } from '@/auth/states/currentUserState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { RouterProvider } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';

export const AppRouter = () => {
  // We want to disable serverless function settings but keep the code for now
  const isFunctionSettingsEnabled = false;

  const currentUser = useRecoilValue(currentUserState);

  const isAdminPageEnabled =
    (currentUser?.canImpersonate || currentUser?.canAccessFullAdminPanel) ??
    false;

  const isPageLayoutFeatureFlagEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
  );

  return (
    <RouterProvider
      router={useCreateAppRouter(
        isFunctionSettingsEnabled,
        isAdminPageEnabled,
        isPageLayoutFeatureFlagEnabled,
      )}
    />
  );
};
