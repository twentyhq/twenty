import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { AppErrorFallback } from '@/error-handler/components/AppErrorFallback';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isLoaded, isErrored, error } = useRecoilValue(
    clientConfigApiStatusState,
  );

  // TODO: Implement a better loading strategy
  if (!isLoaded) return null;

  return !isErrored && error instanceof Error ? (
    <AppErrorFallback
      error={error}
      resetErrorBoundary={() => {
        window.location.reload();
      }}
      title="Could not reach backend"
    />
  ) : (
    children
  );
};
