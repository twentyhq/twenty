import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { doNotTranslate } from 'twenty-shared/i18n';

export const getRecordGqlRelationAliasVariables = (
  relationAliases: RecordGqlRelationAlias[] = [],
) =>
  Object.fromEntries(
    relationAliases.flatMap(({ alias, filter, orderBy, first }) => [
      [doNotTranslate(`${alias}Filter`), filter],
      [doNotTranslate(`${alias}OrderBy`), orderBy],
      [doNotTranslate(`${alias}First`), first],
    ]),
  );
