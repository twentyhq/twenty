export type ConnectedAccount = {
  id: string;
  handle: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  accountOwnerId: string;
  lastSyncHistoryId: string;
};
