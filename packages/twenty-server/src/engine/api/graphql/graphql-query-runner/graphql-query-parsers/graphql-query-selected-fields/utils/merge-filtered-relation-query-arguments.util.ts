import { isNumber } from '@sniptt/guards';
import { type FieldMetadataFilteredRelationComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// A query can narrow a filtered relation further, never widen it:
// its own filter adds to the stored one and it cannot ask for more records than the stored limit
export const mergeFilteredRelationQueryArguments = ({
  requestedArguments = {},
  filteredRelationComputation,
}: {
  requestedArguments?: Record<string, unknown>;
  filteredRelationComputation?: FieldMetadataFilteredRelationComputation;
}): Record<string, unknown> => {
  if (!isDefined(filteredRelationComputation)) {
    return requestedArguments;
  }

  const { orderBy, limit } = filteredRelationComputation;
  const requestedFirst = requestedArguments.first;
  const limits = [requestedFirst, limit].filter(isNumber);

  return {
    ...requestedArguments,
    orderBy: requestedArguments.orderBy ?? orderBy,
    first: limits.length > 0 ? Math.min(...limits) : undefined,
  };
};
