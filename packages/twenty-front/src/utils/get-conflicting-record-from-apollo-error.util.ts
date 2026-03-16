import { type ErrorLike } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';

export type ConflictingRecordInfo = {
  conflictingRecordId: string;
  conflictingObjectNameSingular: string;
};

export const getConflictingRecordFromApolloError = (
  error: ErrorLike,
): ConflictingRecordInfo | null => {
  if (!CombinedGraphQLErrors.is(error)) {
    return null;
  }

  const extensions = error.errors?.[0]?.extensions;

  if (!extensions) {
    return null;
  }

  const conflictingRecordId = extensions.conflictingRecordId;
  const conflictingObjectNameSingular =
    extensions.conflictingObjectNameSingular;

  if (
    !isDefined(conflictingRecordId) ||
    !isDefined(conflictingObjectNameSingular) ||
    typeof conflictingRecordId !== 'string' ||
    typeof conflictingObjectNameSingular !== 'string'
  ) {
    return null;
  }

  return {
    conflictingRecordId,
    conflictingObjectNameSingular,
  };
};
