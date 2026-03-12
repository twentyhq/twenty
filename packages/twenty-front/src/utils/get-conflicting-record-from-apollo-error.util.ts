import { type CombinedGraphQLErrors } from '@apollo/client/errors';
import { isDefined } from 'twenty-shared/utils';

export type ConflictingRecordInfo = {
  conflictingRecordId: string;
  conflictingObjectNameSingular: string;
};

export const getConflictingRecordFromApolloError = (
  error: CombinedGraphQLErrors,
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
