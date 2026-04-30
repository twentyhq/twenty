export type MobileSessionData = {
  id: string;
  userName: string;
  device: string;
  os: string;
  appVersion: string;
  lastActiveAt: string;
  isOnline: boolean;
};

export type OfflineQueueItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retries: number;
};

export type LocationCheckinData = {
  id: string;
  userName: string;
  location: string;
  latitude: number;
  longitude: number;
  checkinTime: string;
  accountName: string;
};
