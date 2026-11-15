import { type GraphQLResolveInfo } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

import { getResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-resolver-selected-fields.util';

export const isCreditsUsedRequested = (info: GraphQLResolveInfo): boolean => {
  const fields = getResolverSelectedFields(info);

  return (
    isDefined(fields.creditsUsedBreakdown) || isDefined(fields.totalCreditsUsed)
  );
};
