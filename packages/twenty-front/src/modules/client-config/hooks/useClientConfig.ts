import { useCallback, useState } from 'react';
import { ClientConfig } from '~/generated/graphql';
import { getClientConfig } from '../utils/getClientConfig';
import { refreshClientConfig } from '../utils/refreshClientConfig';

type UseClientConfigResult = {
  data: { clientConfig: ClientConfig } | undefined;
  loading: boolean;
  error: Error | undefined;
  fetchClientConfig: () => Promise<void>;
  refetchClientConfig: () => Promise<void>;
};

export const useClientConfig = (): UseClientConfigResult => {
  const [data, setData] = useState<{ clientConfig: ClientConfig } | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const fetchClientConfig = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const clientConfig = await getClientConfig();
      setData({ clientConfig });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch client config'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refetchClientConfig = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const clientConfig = await refreshClientConfig();
      setData({ clientConfig });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch client config'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchClientConfig,
    refetchClientConfig,
  };
};
