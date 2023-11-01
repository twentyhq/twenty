import { ApiFieldItem } from '@/settings/developers/types/ApiFieldItem';
import { GetApiKeysQuery } from '~/generated/graphql';
import { beautifyDateDiff } from '~/utils/date-utils';

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention: boolean = false,
  short: boolean = true,
) => {
  if (expiresAt) {
    const dateDiff = beautifyDateDiff(expiresAt, undefined, short);
    if (dateDiff.includes('-')) {
      return 'Expired';
    }
    return withExpiresMention ? `Expires in ${dateDiff}` : `In ${dateDiff}`;
  }
  return withExpiresMention ? 'Never expires' : 'Never';
};

export const formatExpirations = (
  apiKeysQuery: GetApiKeysQuery,
): ApiFieldItem[] => {
  return apiKeysQuery.findManyApiKey.map(({ id, name, expiresAt }) => {
    return {
      id,
      name,
      expiration: formatExpiration(expiresAt || null),
      type: 'internal',
    };
  });
};
