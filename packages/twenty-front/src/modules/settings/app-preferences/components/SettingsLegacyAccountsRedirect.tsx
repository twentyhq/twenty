import { getAppPreferencesPathnameFromLegacyAccountsPathname } from '@/settings/app-preferences/utils/getAppPreferencesPathnameFromLegacyAccountsPathname';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsLegacyAccountsRedirect = () => {
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { pathname, search, hash } = useLocation();

  if (!isAppPreferencesEnabled) {
    return <Outlet />;
  }

  return (
    <Navigate
      to={{
        pathname: getAppPreferencesPathnameFromLegacyAccountsPathname(pathname),
        search,
        hash,
      }}
      replace
    />
  );
};
