import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { type SettingsApplicationStatus } from '@/settings/applications/types/SettingsApplicationStatus';

// Members cannot upgrade apps, only users with the APPLICATIONS permission can
export type SettingsMemberApplicationStatus<
  TConnectedAccount = ConnectedAccount,
> = Exclude<
  SettingsApplicationStatus<TConnectedAccount>,
  { type: 'updateAvailable' }
>;
