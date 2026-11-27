import { UnipileUsers } from '@unipile/sdk';

import { type UnipileUserProfile } from 'src/unipile/types/unipile-user-profile.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const getUnipileUserProfile = async ({
  accountId,
  userId,
  deadlineAtMs,
}: {
  accountId: string;
  userId: string;
  deadlineAtMs: number;
}): Promise<UnipileUserProfile> => {
  const signal = AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1));
  const { data } = await requestUnipile(
    'get user profile with experience',
    () =>
      new UnipileUsers().getUserProfile({
        ...getUnipileRequestOptions(),
        signal,
        path: { account_id: accountId, user_id: userId },
        query: { with_sections: ['linkedin_experience_preview'] },
      }),
    { deadlineAtMs },
  );

  return data;
};
