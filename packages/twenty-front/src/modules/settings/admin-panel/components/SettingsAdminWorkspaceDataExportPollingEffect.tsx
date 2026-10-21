import { useEffect } from 'react';

type SettingsAdminWorkspaceDataExportPollingEffectProps = {
  pollIntervalMs: number;
  startPolling: (pollIntervalMs: number) => void;
  stopPolling: () => void;
};

// Mounted only while an export is pending, so polling stops with the unmount.
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
