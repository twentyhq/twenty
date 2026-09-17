import { isNonEmptyString } from '@sniptt/guards';

export const readRecordIds = (recordIds: unknown): string[] =>
  Array.isArray(recordIds)
    ? [
        ...new Set(
          recordIds
            .filter(isNonEmptyString)
            .map((recordId) => recordId.trim())
            .filter(isNonEmptyString),
        ),
      ]
    : [];
