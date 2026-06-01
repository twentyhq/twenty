export type ShahryarBackupApiStatus = 'healthy' | 'warning' | 'failed';

export type ShahryarBackupApiStatusResponse = {
  status: ShahryarBackupApiStatus;
  label: string;
  lastRunLabel: string;
  intervalHours: number;
  dataSizeLabel: string;
  storageScopeLabel: string;
  operationModeLabel: string;
};
