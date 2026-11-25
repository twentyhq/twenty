import { UnipileCustomAuth } from '@unipile/sdk';
import { isDefined } from 'twenty-sdk/utils';

import { type UnipileAuthIntentResult } from 'src/unipile/types/unipile-auth-intent-result.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const startUnipileLinkedinAuthIntent = async ({
  username,
  password,
  endUserIp,
  deadlineAtMs,
}: {
  username: string;
  password: string;
  endUserIp?: string;
  deadlineAtMs?: number;
}): Promise<UnipileAuthIntentResult> => {
  const { data } = await requestUnipile(
    'start auth intent',
    () =>
      new UnipileCustomAuth().startAuthIntent({
        ...getUnipileRequestOptions(),
        body: {
          provider: 'linkedin',
          credentials: { username, password },
          ...(isDefined(endUserIp)
            ? { config: { auto_proxy_config: { ip: endUserIp } } }
            : {}),
        },
      }),
    { deadlineAtMs },
  );

  return data;
};
