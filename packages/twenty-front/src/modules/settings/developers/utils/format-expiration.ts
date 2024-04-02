import { isNonEmptyString } from '@sniptt/guards';

import { ApiFieldItem } from '@/settings/developers/types/api-key/ApiFieldItem';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { beautifyDateDiff } from '~/utils/date-utils';

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention = false,
  short = true,
) => {
  if (isNonEmptyString(expiresAt)) {
    const dateDiff = beautifyDateDiff(expiresAt, undefined, short);
    if (dateDiff.includes('-')) {
      return 'Expired';
    }
    return withExpiresMention ? `Expires in ${dateDiff}` : `In ${dateDiff}`;
  }
  return withExpiresMention ? 'Never expires' : 'Never';
};

export const formatExpirations = (
  apiKeys: Array<Pick<ApiKey, 'id' | 'name' | 'expiresAt'>>,
): ApiFieldItem[] => {
  return apiKeys.map(({ id, name, expiresAt }) => {
    return {
      id,
      name,
      expiration: formatExpiration(expiresAt || null),
      type: 'internal',
    };
  });
};
