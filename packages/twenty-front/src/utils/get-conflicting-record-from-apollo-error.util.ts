import { type ApolloError } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';

export type ConflictingRecordInfo = {
  conflictingRecordId: string;
  conflictingObjectNameSingular: string;
};

export const getConflictingRecordFromApolloError = (
  error: ApolloError,
): ConflictingRecordInfo | null => {
  const extensions = error.graphQLErrors?.[0]?.extensions;

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
