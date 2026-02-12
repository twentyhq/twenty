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
  useDirectTableReference = false,
}: {
  operator: string;
  objectNameSingular: string;
  key: string;
  subFieldKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  fieldMetadataType: FieldMetadataType;
  useDirectTableReference?: boolean;
}): WhereConditionParts => {
  const uuid = Math.random().toString(36).slice(2, 7);

  const secondUuid = Math.random().toString(36).slice(2, 7);

  const fieldReference = useDirectTableReference
    ? `"${key}"`
    : `"${objectNameSingular}"."${key}"`;

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
        sql: `${fieldReference} = '{}'${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: {},
      };
    case 'eq':
      return {
        sql: `${fieldReference} = :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'neq':
      return {
        sql: `${fieldReference} != :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NOT NULL` : ''}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'gt':
      return {
        sql: `${fieldReference} > :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'gte':
      return {
        sql: `${fieldReference} >= :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'lt':
      return {
        sql: `${fieldReference} < :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'lte':
      return {
        sql: `${fieldReference} <= :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'in':
      return {
        sql: `${fieldReference} IN (:...${key}${uuid})`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'is':
      return {
        sql: `${fieldReference} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} = :${key}${secondUuid}` : ''}`,
        params: hasNullEquivalentFieldValue
          ? { [`${key}${secondUuid}`]: nullEquivalentFieldValue }
          : {},
      };
    case 'like':
      return {
        sql: `${fieldReference}::text LIKE :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'ilike':
      return {
        sql: `${fieldReference}::text ILIKE :${key}${uuid}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'startsWith':
      return {
        sql: `${fieldReference}::text ^@ :${key}${uuid}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'endsWith':
      return {
        sql: `RIGHT(${fieldReference}::text, LENGTH(:${key}${uuid})) = :${key}${uuid}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'contains':
      return {
        sql: `${fieldReference} @> ARRAY[:...${key}${uuid}]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'search': {
      const tsQuery = formatSearchTerms(value, 'and');

      return {
        sql: `(
          ${fieldReference} @@ to_tsquery('simple', public.unaccent_immutable(:${key}${uuid}Ts)) OR
          public.unaccent_immutable(${fieldReference}::text) ILIKE public.unaccent_immutable(:${key}${uuid}Like)
        )`,
        params: {
          [`${key}${uuid}Ts`]: tsQuery,
          [`${key}${uuid}Like`]: `%${value}%`,
        },
      };
    }
    case 'notContains':
      return {
        sql: `NOT (${fieldReference}::text[] && ARRAY[:...${key}${uuid}]::text[])`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsAny':
      return {
        sql: `${fieldReference}::text[] && ARRAY[:...${key}${uuid}]::text[]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsIlike':
      return {
        sql: `EXISTS (SELECT 1 FROM unnest(${fieldReference}) AS elem WHERE elem ILIKE :${key}${uuid})`,
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
