import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { formatConnectedAccountSenderValue } from '@/accounts/utils/formatConnectedAccountSenderValue';
import { type SelectOption } from 'twenty-ui/input';

export const buildConnectedAccountSenderOptions = (
  accounts: Pick<ConnectedAccount, 'id' | 'handle' | 'handleAliases'>[],
): SelectOption<string>[] =>
  accounts.flatMap((account) =>
    [account.handle, ...(account.handleAliases ?? [])].map((handle) => ({
      label: handle,
      value: formatConnectedAccountSenderValue(account.id, handle),
    })),
  );
