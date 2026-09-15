import { isNonEmptyString } from '@sniptt/guards';

// The route body is whatever the caller posted, so nothing here can be assumed
// to match the declared payload type.
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
