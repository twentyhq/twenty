import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';
import { AppPath } from '@/types/AppPath';
import { useLocation } from 'react-router-dom';
import { isMatchingLocation } from '~/utils/isMatchingLocation';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isLoaded, isErrored, error } = useRecoilValue(
    clientConfigApiStatusState,
  );

  const location = useLocation();

  // TODO: Implement a better loading strategy
  if (
    !isLoaded &&
    !isMatchingLocation(location, AppPath.Verify) &&
    !isMatchingLocation(location, AppPath.VerifyEmail)
  )
    return null;

  return isErrored && error instanceof Error ? (
    <AppFullScreenErrorFallback
      error={error}
      resetErrorBoundary={() => {
        window.location.reload();
      }}
      title="Unable to Reach Back-end"
    />
  ) : (
    children
  );
};
