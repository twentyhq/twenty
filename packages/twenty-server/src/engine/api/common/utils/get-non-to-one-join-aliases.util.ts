import { type Alias } from 'typeorm/query-builder/Alias';
import { type RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { isDefined } from 'twenty-shared/utils';

type QueryBuilderWithJoinAttributes = {
  expressionMap: {
    joinAttributes: {
      alias: Pick<Alias, 'name'>;
      relation?: Pick<RelationMetadata, 'isOneToMany' | 'isManyToMany'>;
    }[];
  };
};

export const getNonToOneJoinAliases = (
  queryBuilder: QueryBuilderWithJoinAttributes,
): string[] =>
  queryBuilder.expressionMap.joinAttributes
    .filter(
      ({ relation }) =>
        !isDefined(relation) || relation.isOneToMany || relation.isManyToMany,
    )
    .map(({ alias }) => alias.name);
