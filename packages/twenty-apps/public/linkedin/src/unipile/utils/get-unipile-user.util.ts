import { UnipileUsers } from '@unipile/sdk';

import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const getUnipileUser = async ({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}): Promise<UnipileUser> => {
  const { data } = await requestUnipile('get user profile', () =>
    new UnipileUsers().getUserProfile({
      ...getUnipileRequestOptions(),
      path: { account_id: accountId, user_id: userId },
    }),
  );

  return data;
};
