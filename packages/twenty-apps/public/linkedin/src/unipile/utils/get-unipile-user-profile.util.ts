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
  deadlineAtMs?: number;
}): Promise<UnipileUserProfile> => {
  const { data } = await requestUnipile(
    'get user profile with experience',
    () =>
      new UnipileUsers().getUserProfile({
        ...getUnipileRequestOptions(),
        path: { account_id: accountId, user_id: userId },
        query: { with_sections: ['linkedin_experience_preview'] },
      }),
    { deadlineAtMs },
  );

  return data;
};
