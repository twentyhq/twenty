import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export type AppPreferencesAppStatus<TConnectedAccount = ConnectedAccount> =
  | { type: 'accountSyncIssue'; account: TConnectedAccount }
  | { type: 'reconnectNeeded' }
  | { type: 'missingConfiguration' }
  | { type: 'notConnected' };
