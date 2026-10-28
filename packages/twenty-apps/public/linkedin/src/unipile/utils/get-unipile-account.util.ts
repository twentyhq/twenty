import { UnipileAccounts } from '@unipile/sdk';

import { type UnipileAccount } from 'src/unipile/types/unipile-account.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const getUnipileAccount = async (
  accountId: string,
): Promise<UnipileAccount> => {
  const { data } = await new UnipileAccounts().getAccount({
    ...getUnipileRequestOptions(),
    path: { account_id: accountId },
  });

  return data;
};
