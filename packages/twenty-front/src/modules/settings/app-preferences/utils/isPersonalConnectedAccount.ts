import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { ConnectedAccountProvider } from 'twenty-shared/types';

export const isPersonalConnectedAccount = ({
  account,
  userWorkspaceId,
}: {
  account: Pick<ConnectedAccount, 'provider' | 'scope' | 'userWorkspaceId'>;
  userWorkspaceId: string;
}) =>
  account.userWorkspaceId === userWorkspaceId &&
  (account.provider !== ConnectedAccountProvider.APP ||
    account.scope === 'USER');
