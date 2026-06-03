import { fetchShahryarBackupStatus } from '@/shahryar/services/shahryarReportApi';
import { type ShahryarBackupApiStatusResponse } from '@/shahryar/types/shahryarBackupApi';
import { useCallback, useEffect, useState } from 'react';

export const useShahryarBackupStatus = () => {
  const [backupStatus, setBackupStatus] = useState<
    ShahryarBackupApiStatusResponse | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const refresh = useCallback(
    async ({ signal }: { signal?: AbortSignal } = {}) => {
      setIsLoading(true);
      setErrorMessage(undefined);

      try {
        setBackupStatus(await fetchShahryarBackupStatus({ signal }));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setErrorMessage('backup-status-unavailable');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const abortController = new AbortController();

    void refresh({ signal: abortController.signal });

    return () => abortController.abort();
  }, [refresh]);

  return {
    backupStatus,
    errorMessage,
    isLoading,
    refresh,
  };
};
