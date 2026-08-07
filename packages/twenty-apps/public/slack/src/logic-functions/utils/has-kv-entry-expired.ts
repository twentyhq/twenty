import { isNumber } from '@sniptt/guards';

export const hasKvEntryExpired = (entry: { expiresAt?: number }): boolean =>
  !isNumber(entry.expiresAt) || entry.expiresAt <= Date.now();
