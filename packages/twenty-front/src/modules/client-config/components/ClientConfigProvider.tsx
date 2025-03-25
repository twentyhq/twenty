import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { AppFullScreenErrorFallback } from '@/error-handler/components/AppFullScreenErrorFallback';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isLoaded, isErrored, error } = useRecoilValue(
    clientConfigApiStatusState,
  );

  // TODO: Implement a better loading strategy
  if (!isLoaded) return null;

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
