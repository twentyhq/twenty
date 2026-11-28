import { UnipileUsers } from '@unipile/sdk';
import { isDefined } from 'twenty-sdk/utils';

import { type UnipileUserProfile } from 'src/unipile/types/unipile-user-profile.type';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const getUnipileUser = async ({
  accountId,
  userId,
  deadlineAtMs,
  withSections,
}: {
  accountId: string;
  userId: string;
  deadlineAtMs?: number;
  withSections?: 'linkedin_experience_preview'[];
}): Promise<UnipileUserProfile> => {
  const signal = isDefined(deadlineAtMs)
    ? AbortSignal.timeout(Math.max(deadlineAtMs - Date.now(), 1))
    : undefined;
  const { data } = await requestUnipile(
    'get user profile',
    () =>
      new UnipileUsers().getUserProfile({
        ...getUnipileRequestOptions(),
        signal,
        path: { account_id: accountId, user_id: userId },
        ...(isDefined(withSections)
          ? { query: { with_sections: withSections } }
          : {}),
      }),
    { deadlineAtMs },
  );

  return data;
};
