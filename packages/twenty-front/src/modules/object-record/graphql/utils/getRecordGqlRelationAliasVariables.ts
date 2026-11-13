import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';

export const getRecordGqlRelationAliasVariables = (
  relationAliases: RecordGqlRelationAlias[] = [],
) =>
  Object.fromEntries(
    relationAliases.flatMap(({ alias, filter, orderBy, first }) => [
      [`${alias}Filter`, filter],
      [`${alias}OrderBy`, orderBy],
      [`${alias}First`, first],
    ]),
  );
