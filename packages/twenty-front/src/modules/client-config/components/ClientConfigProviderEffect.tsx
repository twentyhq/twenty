import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const ClientConfigProviderEffect = () => {
  // oxlint-disable-next-line twenty/no-state-useref
  const isInitializationStarted = useRef(false);
  const [clientConfigApiStatus, setClientConfigApiStatus] = useAtomState(
    clientConfigApiStatusState,
  );

  const { data, loading, error, initializeClientConfig } = useClientConfig();

  useEffect(() => {
    if (
      !clientConfigApiStatus.isLoadedOnce &&
      !clientConfigApiStatus.isLoading &&
      !isInitializationStarted.current
    ) {
      isInitializationStarted.current = true;
      initializeClientConfig();
    }
  }, [
    clientConfigApiStatus.isLoadedOnce,
    clientConfigApiStatus.isLoading,
    initializeClientConfig,
  ]);

  useEffect(() => {
    if (loading) return;

    if (error instanceof Error) {
      setClientConfigApiStatus((currentStatus) => ({
        ...currentStatus,
        isErrored: true,
        error,
      }));
      return;
    }

    if (!isDefined(data?.clientConfig)) {
      return;
    }
  }, [data?.clientConfig, error, loading, setClientConfigApiStatus]);

  return <></>;
};
