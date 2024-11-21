import { useRecoilValue } from 'recoil';

import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { ClientConfigError } from '@/error-handler/components/ClientConfigError';

export const ClientConfigProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isLoaded, isErrored, error } = useRecoilValue(
    clientConfigApiStatusState,
  );

  // TODO: Implement a better loading strategy
  if (!isLoaded) return null;

  return isErrored && error instanceof Error ? (
    <ClientConfigError error={error} />
  ) : (
    children
  );
};
