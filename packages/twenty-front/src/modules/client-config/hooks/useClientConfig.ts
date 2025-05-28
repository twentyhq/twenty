import { useRecoilCallback, useRecoilValue } from 'recoil';
import { ClientConfig } from '~/generated/graphql';
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

  const fetchClientConfig = useRecoilCallback(
    ({ set }) =>
      async () => {
        set(clientConfigApiStatusState, (prev) => ({
          ...prev,
          isLoading: true,
          isErrored: false,
          error: undefined,
        }));

        try {
          const clientConfig = await getClientConfig();
          set(clientConfigApiStatusState, (prev) => ({
            ...prev,
            isLoading: false,
            isLoaded: false,
            data: { clientConfig },
          }));
        } catch (err) {
          const error =
            err instanceof Error
              ? err
              : new Error('Failed to fetch client config');
          set(clientConfigApiStatusState, (prev) => ({
            ...prev,
            isLoading: false,
            isErrored: true,
            error,
          }));
        }
      },
    [],
  );

  return {
    data: clientConfigApiStatus.data,
    loading: clientConfigApiStatus.isLoading || false,
    error: clientConfigApiStatus.error,
    fetchClientConfig,
    refetch: fetchClientConfig,
  };
};
