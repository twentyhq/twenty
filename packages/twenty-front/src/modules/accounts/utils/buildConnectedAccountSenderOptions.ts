import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { getSendableEmailHandles } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

export const buildConnectedAccountSenderOptions = (
  accounts: Pick<ConnectedAccount, 'handle' | 'handleAliases'>[],
): SelectOption<string>[] => {
  const handles = accounts.flatMap((account) =>
    getSendableEmailHandles(account),
  );

  return [...new Set(handles)].map((handle) => ({
    label: handle,
    value: handle,
  }));
};
