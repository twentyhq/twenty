import { type GraphQLResolveInfo } from 'graphql';

import { getGraphqlFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-graphql-field-selections.util';

export const isCreditsUsedRequested = (info: GraphQLResolveInfo): boolean =>
  getGraphqlFieldSelections(info).some(({ fieldName }) =>
    ['creditsUsedBreakdown', 'totalCreditsUsed'].includes(fieldName),
  );
