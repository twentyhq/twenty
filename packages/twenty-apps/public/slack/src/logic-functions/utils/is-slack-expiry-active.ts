import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

export const isSlackExpiryActive = (
  entry: { expiresAt?: number } | null,
): boolean =>
  isDefined(entry) && isNumber(entry.expiresAt) && entry.expiresAt > Date.now();
