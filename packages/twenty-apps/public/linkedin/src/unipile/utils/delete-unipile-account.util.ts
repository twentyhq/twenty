import { UnipileAccounts } from '@unipile/sdk';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const deleteUnipileAccount = async (accountId: string): Promise<void> => {
  const { error, response } = await new UnipileAccounts().removeAccount({
    ...getUnipileRequestOptions(),
    throwOnError: false,
    path: { account_id: accountId },
  });

  if (error !== undefined && response.status !== 404) {
    throw new Error(
      `Unipile account ${accountId} removal failed with ${response.status}: ${JSON.stringify(error)}`,
    );
  }
};
