import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

export const getFanOutJoinAliases = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
): string[] =>
  queryBuilder.expressionMap.joinAttributes
    .filter(
      ({ relation }) =>
        !isDefined(relation) || relation.isOneToMany || relation.isManyToMany,
    )
    .map(({ alias }) => alias.name);
