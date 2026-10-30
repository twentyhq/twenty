import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export type SettingsApplicationStatus<TConnectedAccount = ConnectedAccount> =
  | { type: 'accountSyncIssue'; account: TConnectedAccount }
  | { type: 'reconnectNeeded' }
  | { type: 'missingConfiguration' }
  | { type: 'notConnected' }
  | { type: 'updateAvailable' };
