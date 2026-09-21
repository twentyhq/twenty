import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { Navigate } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const DpaRedirect = () => {
  const isLogged = useIsLogged();

  if (!isLogged) {
    return (
      <Navigate
        to={`${AppPath.SignInUp}?returnToPath=${encodeURIComponent(
          getSettingsPath(SettingsPath.LegalDpa),
        )}`}
        replace
      />
    );
  }

  return <Navigate to={getSettingsPath(SettingsPath.LegalDpa)} replace />;
};
