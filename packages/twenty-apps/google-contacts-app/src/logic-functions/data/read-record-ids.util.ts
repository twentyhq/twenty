import { isNonEmptyString } from '@sniptt/guards';

export const readRecordIds = (recordIds: string[] | undefined): string[] =>
  [...new Set(recordIds ?? [])].filter(isNonEmptyString);
