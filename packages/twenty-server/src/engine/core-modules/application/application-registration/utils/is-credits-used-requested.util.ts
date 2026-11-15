import { type GraphQLResolveInfo } from 'graphql';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { getFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-field-selections.util';
import { getResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-resolver-selected-fields.util';

export const isCreditsUsedRequested = (info: GraphQLResolveInfo): boolean => {
  const selectedFields = getResolverSelectedFields(info);

  return ['creditsUsedBreakdown', 'totalCreditsUsed'].some((fieldName) =>
    isNonEmptyArray(getFieldSelections({ selectedFields, fieldName })),
  );
};
