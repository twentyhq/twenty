import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  lowercaseUrlOriginAndRemoveTrailingSlash,
} from 'twenty-shared/utils';

export const transformRelationConnectWhereValue = (
  connectWhere: Record<string, unknown>,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(connectWhere).map(([key, value]) => {
      if (!isDefined(value) || typeof value !== 'object') {
        return [key, value];
      }

      const compositeValue = value as Record<string, unknown>;
      const normalized: Record<string, unknown> = { ...compositeValue };

      if (isNonEmptyString(compositeValue.primaryLinkUrl)) {
        normalized.primaryLinkUrl = lowercaseUrlOriginAndRemoveTrailingSlash(
          compositeValue.primaryLinkUrl,
        );
      }

      if (isNonEmptyString(compositeValue.primaryEmail)) {
        normalized.primaryEmail = compositeValue.primaryEmail.toLowerCase();
      }

      return [key, normalized];
    }),
  );
};
