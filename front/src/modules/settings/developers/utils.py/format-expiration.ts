import { ApiKeyItem } from '@/settings/developers/types/ApisFieldItem';
import { GetApiKeysQuery } from '~/generated/graphql';
import { beautifyDateDiff } from '~/utils/date-utils';

export const formatExpiration = (
  expiresAt: string | null,
  withExpiresMention: boolean = false,
  short: boolean = true,
) => {
  let expiration = 'Never';
  if (withExpiresMention) expiration = 'Never expires';
  if (expiresAt) {
    if (withExpiresMention) {
      expiration = 'Expires in';
    } else {
      expiration = 'In';
    }
    expiration = `${expiration} ${beautifyDateDiff(
      expiresAt,
      undefined,
      short,
    )}`;
  }
  if (expiration.includes('-')) {
    expiration = 'Expired';
  }
  return expiration;
};

export const formatExpirations = (
  apiKeysQuery: GetApiKeysQuery,
): ApiKeyItem[] => {
  return apiKeysQuery.findManyApiKey.map(({ id, name, expiresAt }) => {
    return {
      id,
      name,
      expiration: formatExpiration(expiresAt || null),
      type: 'internal',
    };
  });
};
