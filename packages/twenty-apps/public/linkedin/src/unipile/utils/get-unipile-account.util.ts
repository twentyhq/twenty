import { type UnipileAccount } from 'src/unipile/types/unipile-account.type';
import { callUnipileApi } from 'src/unipile/utils/call-unipile-api.util';

export const getUnipileAccount = (accountId: string): Promise<UnipileAccount> =>
  callUnipileApi<UnipileAccount>({
    method: 'GET',
    path: `/accounts/${encodeURIComponent(accountId)}`,
  });
