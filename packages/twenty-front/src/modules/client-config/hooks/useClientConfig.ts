import { ClientConfig } from '@/client-config/types/ClientConfig';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { clientConfigApiStatusState } from '../states/clientConfigApiStatusState';
import { getClientConfig } from '../utils/getClientConfig';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const clientConfigApiStatus = useRecoilValue(clientConfigApiStatusState);
  const setClientConfigApiStatus = useSetRecoilState(
    clientConfigApiStatusState,
  );

  const fetchClientConfig = useCallback(async () => {
    setClientConfigApiStatus((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      const clientConfig = await getClientConfig();
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: false,
        error: undefined,
        data: { clientConfig },
      }));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to fetch client config');
      setClientConfigApiStatus((prev) => ({
        ...prev,
        isLoading: false,
        isLoadedOnce: true,
        isErrored: true,
        error,
      }));
    }
  }, [setClientConfigApiStatus]);

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
