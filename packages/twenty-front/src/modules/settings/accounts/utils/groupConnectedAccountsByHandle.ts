import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { emailSchema, isDefined } from 'twenty-shared/utils';

export const groupConnectedAccountsByHandle = <
  TConnectedAccount extends Pick<ConnectedAccount, 'id' | 'handle'>,
>(
  accounts: TConnectedAccount[],
) => {
  const groups = new Map<
    string,
    { id: string; handle: string; accounts: TConnectedAccount[] }
  >();

  for (const account of accounts) {
    const trimmedHandle = account.handle.trim();
    const isEmailHandle = emailSchema.safeParse(trimmedHandle).success;
    const handle = isEmailHandle ? trimmedHandle.toLowerCase() : account.handle;
    const id = isEmailHandle ? `email:${handle}` : `account:${account.id}`;
    const group = groups.get(id);

    if (isDefined(group)) {
      group.accounts.push(account);
    } else {
      groups.set(id, { id, handle, accounts: [account] });
    }
  }

  return [...groups.values()];
};
