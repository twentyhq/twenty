import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export type ConnectedAccountGroup<TConnectedAccount = ConnectedAccount> = {
  id: string;
  handle: string;
  builtInAccount?: TConnectedAccount;
  appAccounts: TConnectedAccount[];
};
