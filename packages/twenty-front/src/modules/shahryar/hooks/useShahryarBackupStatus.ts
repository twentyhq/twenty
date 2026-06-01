import { fetchShahryarBackupStatus } from '@/shahryar/services/shahryarReportApi';
import { type ShahryarBackupApiStatusResponse } from '@/shahryar/types/shahryarBackupApi';
import { useCallback, useEffect, useState } from 'react';

const FALLBACK_SHAHRYAR_BACKUP_STATUS: ShahryarBackupApiStatusResponse = {
  status: 'healthy',
  label: 'Healthy',
  lastRunLabel: '2026-06-01 02:15 UTC',
  intervalHours: 24,
  dataSizeLabel: '1.8 GB',
  storageScopeLabel: 'Postgres + فایلە پەیوەندیدارەکان',
  operationModeLabel: 'Existing database backup operations',
};

export const useShahryarBackupStatus = () => {
  const [backupStatus, setBackupStatus] =
    useState<ShahryarBackupApiStatusResponse>(FALLBACK_SHAHRYAR_BACKUP_STATUS);
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

        setBackupStatus(FALLBACK_SHAHRYAR_BACKUP_STATUS);
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
