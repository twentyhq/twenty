import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';

export const mockedConnectedAccounts: Pick<
  ConnectedAccount,
  'id' | 'handle'
>[] = [
  { id: '876ee608-d1e4-402d-9970-b3ca49b85cb9', handle: 'john.doe@twenty.com' },
];
