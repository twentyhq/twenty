import { useClientConfig } from '@/client-config/hooks/useClientConfig';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ClientConfigProviderEffect = () => {
  const [clientConfigApiStatus, setClientConfigApiStatus] = useRecoilState(
    clientConfigApiStatusState,
  );

  const { data, loading, error, fetchClientConfig } = useClientConfig();

  useEffect(() => {
    if (
      !clientConfigApiStatus.isLoadedOnce &&
      !clientConfigApiStatus.isLoading
    ) {
      fetchClientConfig();
    }
  }, [
    clientConfigApiStatus.isLoadedOnce,
    clientConfigApiStatus.isLoading,
    fetchClientConfig,
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
