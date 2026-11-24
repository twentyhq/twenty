import { getAppPreferencesPathnameFromLegacyAccountsPathname } from '@/settings/app-preferences/utils/getAppPreferencesPathnameFromLegacyAccountsPathname';
import { Navigate, useLocation } from 'react-router-dom';

export const SettingsLegacyAccountsRedirect = () => {
  const { pathname, search, hash } = useLocation();

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
