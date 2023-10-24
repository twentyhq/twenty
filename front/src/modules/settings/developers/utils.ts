import { ApiKeyItem } from '@/settings/developers/types/ApisFieldItem';
import { GetApiKeysQuery } from '~/generated/graphql';
import { beautifyDateDiff } from '~/utils/date-utils';

export const formatExpirations = (
  apiKeysQuery: GetApiKeysQuery,
): ApiKeyItem[] => {
  return apiKeysQuery.findManyApiKey.map(({ id, name, expiresAt }) => {
    let expiration = 'Never';
    if (expiresAt) {
      expiration = `In ${beautifyDateDiff(expiresAt, undefined, true)}`;
    }
    if (expiration.includes('-')) {
      expiration = 'Expired';
    }
    return {
      id,
      name,
      expiration,
      type: 'internal',
    };
  });
};
