import { useQuery } from '@apollo/client/react';

import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { canConnectedAccountSendEmail } from '@/accounts/utils/canConnectedAccountSendEmail';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

type UseFirstConnectedAccountOptions = {
  skip?: boolean;
};

export const useFirstConnectedAccount = (
  options?: UseFirstConnectedAccountOptions,
) => {
  const { data, loading } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS, {
    skip: options?.skip,
  });

  // The oldest connected account is frequently an SSO or application connection
  // rather than a mailbox, and those cannot send.
  const firstAccount =
    data?.myConnectedAccounts?.find(canConnectedAccountSendEmail) ?? null;

  return {
    connectedAccountId: firstAccount?.id ?? null,
    connectedAccountHandle: firstAccount?.handle ?? null,
    loading,
  };
};
