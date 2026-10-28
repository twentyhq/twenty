import { type UnipileUser } from 'src/unipile/types/unipile-user.type';
import { callUnipileApi } from 'src/unipile/utils/call-unipile-api.util';

export const getUnipileUser = ({
  accountId,
  userId,
}: {
  accountId: string;
  userId: string;
}): Promise<UnipileUser> =>
  callUnipileApi<UnipileUser>({
    method: 'GET',
    path: `/${encodeURIComponent(accountId)}/users/${encodeURIComponent(userId)}`,
  });
