import { type GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { isDefined } from 'twenty-shared/utils';

export const isCreditsUsedRequested = (info: GraphQLResolveInfo): boolean => {
  const fields = graphqlFields(info);

  return (
    isDefined(fields.creditsUsedBreakdown) || isDefined(fields.totalCreditsUsed)
  );
};
