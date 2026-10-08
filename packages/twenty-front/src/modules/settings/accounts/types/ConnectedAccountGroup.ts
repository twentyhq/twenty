import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export type ConnectedAccountGroup<TConnectedAccount = ConnectedAccount> = {
  id: string;
  handle: string;
  nativeAccount?: TConnectedAccount;
  appAccounts: TConnectedAccount[];
};
