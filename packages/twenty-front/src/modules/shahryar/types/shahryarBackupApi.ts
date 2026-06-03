export type ShahryarBackupApiStatus = 'healthy' | 'warning' | 'failed';

export type ShahryarBackupApiHistoryEntry = {
  id: string;
  status: ShahryarBackupApiStatus;
  label: string;
  completedAt: string;
  completedAtLabel: string;
  dataSizeLabel: string;
  storageScopeLabel: string;
  failureReason?: string;
};

export type ShahryarBackupApiManualExport = {
  isAvailable: boolean;
  label: string;
  downloadUrl?: string;
};

export type ShahryarBackupApiStatusResponse = {
  status: ShahryarBackupApiStatus;
  label: string;
  lastRunLabel: string;
  lastSuccessfulBackupAt?: string;
  lastSuccessfulBackupLabel: string;
  nextScheduledBackupAt?: string;
  nextScheduledBackupLabel: string;
  intervalHours: number;
  dataSizeLabel: string;
  storageScopeLabel: string;
  operationModeLabel: string;
  failureReason?: string;
  manualExport: ShahryarBackupApiManualExport;
  history: ShahryarBackupApiHistoryEntry[];
};
