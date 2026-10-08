import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';

export type ConnectedAccountGroup = {
  id: string;
  handle: string;
  accounts: ConsolidatedConnectedAccount[];
};
