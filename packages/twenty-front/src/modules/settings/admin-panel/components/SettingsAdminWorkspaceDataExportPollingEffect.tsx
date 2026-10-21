import { useEffect } from 'react';

type SettingsAdminWorkspaceDataExportPollingEffectProps = {
  pollIntervalMs: number;
  startPolling: (pollIntervalMs: number) => void;
  stopPolling: () => void;
};

export const SettingsAdminWorkspaceDataExportPollingEffect = ({
  pollIntervalMs,
  startPolling,
  stopPolling,
}: SettingsAdminWorkspaceDataExportPollingEffectProps) => {
  useEffect(() => {
    startPolling(pollIntervalMs);

    return () => stopPolling();
  }, [pollIntervalMs, startPolling, stopPolling]);

  return null;
};
