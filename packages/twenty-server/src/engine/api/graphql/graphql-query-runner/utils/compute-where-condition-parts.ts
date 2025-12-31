import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { findPostgresDefaultNullEquivalentValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/find-postgres-default-null-equivalent-value.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';

type WhereConditionParts = {
  sql: string;
  params: ObjectLiteral;
};

export const computeWhereConditionParts = ({
  operator,
  objectNameSingular,
  key,
  subFieldKey,
  value,
  fieldMetadataType,
}: {
  operator: string;
  objectNameSingular: string;
  key: string;
  subFieldKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  fieldMetadataType: FieldMetadataType;
}): WhereConditionParts => {
  const uuid = Math.random().toString(36).slice(2, 7);

  const secondUuid = Math.random().toString(36).slice(2, 7);

  //TODO : Remove filter null equivalence injection once feature flag removed + null equivalence transformation added in ORM
  const nullEquivalentFieldValue = findPostgresDefaultNullEquivalentValue(
    value,
    fieldMetadataType,
    subFieldKey,
  );

  const hasNullEquivalentFieldValue = isDefined(nullEquivalentFieldValue);

  switch (operator) {
    case 'isEmptyArray':
      return {
        sql: `"${objectNameSingular}"."${key}" = '{}'${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" IS NULL` : ''}`,
        params: {},
      };
    case 'eq':
      return {
        sql: `"${objectNameSingular}"."${key}" = :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'neq':
      return {
        sql: `"${objectNameSingular}"."${key}" != :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" IS NOT NULL` : ''}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'gt':
      return {
        sql: `"${objectNameSingular}"."${key}" > :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'gte':
      return {
        sql: `"${objectNameSingular}"."${key}" >= :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'lt':
      return {
        sql: `"${objectNameSingular}"."${key}" < :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'lte':
      return {
        sql: `"${objectNameSingular}"."${key}" <= :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'in':
      return {
        sql: `"${objectNameSingular}"."${key}" IN (:...${key}${uuid})`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'is':
      return {
        sql: `"${objectNameSingular}"."${key}" IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" = :${key}${secondUuid}` : ''}`,
        params: hasNullEquivalentFieldValue
          ? { [`${key}${secondUuid}`]: nullEquivalentFieldValue }
          : {},
      };
    case 'like':
      return {
        sql: `"${objectNameSingular}"."${key}"::text LIKE :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'ilike':
      return {
        sql: `"${objectNameSingular}"."${key}"::text ILIKE :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR "${objectNameSingular}"."${key}" IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'startsWith':
      return {
        sql: `"${objectNameSingular}"."${key}"::text LIKE :${key}${uuid}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'endsWith':
      return {
        sql: `"${objectNameSingular}"."${key}"::text LIKE :${key}${uuid}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'contains':
      return {
        sql: `"${objectNameSingular}"."${key}" @> ARRAY[:...${key}${uuid}]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'search': {
      const tsQuery = formatSearchTerms(value, 'and');

      return {
        sql: `(
          "${objectNameSingular}"."${key}" @@ to_tsquery('simple', public.unaccent_immutable(:${key}${uuid}Ts)) OR
          public.unaccent_immutable("${objectNameSingular}"."${key}"::text) ILIKE public.unaccent_immutable(:${key}${uuid}Like)
        )`,
        params: {
          [`${key}${uuid}Ts`]: tsQuery,
          [`${key}${uuid}Like`]: `%${value}%`,
        },
      };
    }
    case 'notContains':
      return {
        sql: `NOT ("${objectNameSingular}"."${key}"::text[] && ARRAY[:...${key}${uuid}]::text[])`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsAny':
      return {
        sql: `"${objectNameSingular}"."${key}"::text[] && ARRAY[:...${key}${uuid}]::text[]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsIlike':
      return {
        sql: `EXISTS (SELECT 1 FROM unnest("${objectNameSingular}"."${key}") AS elem WHERE elem ILIKE :${key}${uuid})`,
        params: { [`${key}${uuid}`]: value },
      };
    default:
      throw new GraphqlQueryRunnerException(
        `Operator "${operator}" is not supported`,
        GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
  }
};
