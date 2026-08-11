import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

export const canBoundScanWithDirectLimit = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
): boolean =>
  queryBuilder.expressionMap.joinAttributes.every(({ relation }) => {
    if (!isDefined(relation)) {
      return false;
    }

    return !relation.isOneToMany && !relation.isManyToMany;
  });
