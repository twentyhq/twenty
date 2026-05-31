import { randomBytes } from 'crypto';

import { FieldMetadataType } from 'twenty-shared/types';
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
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  value: any;
  fieldMetadataType: FieldMetadataType;
  useDirectTableReference?: boolean;
}): WhereConditionParts => {
  const paramSuffix = randomBytes(5).toString('hex');

  const secondParamSuffix = randomBytes(5).toString('hex');

  const fieldReference = useDirectTableReference
    ? `"${key}"`
    : `"${objectNameSingular}"."${key}"`;

  // DATE_TIME values are millisecond-precision in the application layer (a JS
  // Date cannot hold sub-millisecond digits), but are stored as microsecond
  // timestamptz in Postgres. Comparing the raw column against a millisecond
  // value therefore mismatches: e.g. a row stored as ...061789 is never equal
  // to the cursor value ...061, which breaks cursor pagination over rows
  // sharing a millisecond (#20520). Compare at millisecond precision so both
  // sides align. date_trunc floors, matching Date.toISOString().
  const comparableFieldReference =
    fieldMetadataType === FieldMetadataType.DATE_TIME
      ? `date_trunc('milliseconds', ${fieldReference})`
      : fieldReference;

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
        sql: `${comparableFieldReference} = :${key}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'neq':
      return {
        sql: `${comparableFieldReference} != :${key}${paramSuffix}${hasNullEquivalentFieldValue ? ` AND ${fieldReference} IS NOT NULL` : ''}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'gt':
      return {
        sql: `${comparableFieldReference} > :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'gte':
      return {
        sql: `${comparableFieldReference} >= :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'lt':
      return {
        sql: `${comparableFieldReference} < :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'lte':
      return {
        sql: `${comparableFieldReference} <= :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'in':
      return {
        sql: `${fieldReference} IN (:...${key}${paramSuffix})`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'is':
      return {
        sql: `${fieldReference} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} = :${key}${secondParamSuffix}` : ''}`,
        params: hasNullEquivalentFieldValue
          ? { [`${key}${secondParamSuffix}`]: nullEquivalentFieldValue }
          : {},
      };
    case 'like':
      return {
        sql: `${fieldReference}::text LIKE :${key}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${paramSuffix}`]: `${value}` },
      };
    case 'ilike':
      return {
        sql: `${fieldReference}::text ILIKE :${key}${paramSuffix}${hasNullEquivalentFieldValue ? ` OR ${fieldReference} IS NULL` : ''}`,
        params: { [`${key}${paramSuffix}`]: `${value}` },
      };
    case 'startsWith':
      return {
        sql: `${fieldReference}::text ^@ :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: `${value}` },
      };
    case 'endsWith':
      return {
        sql: `RIGHT(${fieldReference}::text, LENGTH(:${key}${paramSuffix})) = :${key}${paramSuffix}`,
        params: { [`${key}${paramSuffix}`]: `${value}` },
      };
    case 'contains':
      return {
        sql: `${fieldReference} @> ARRAY[:...${key}${paramSuffix}]`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'search': {
      const tsQuery = formatSearchTerms(value, 'and');

      return {
        sql: `(
          ${fieldReference} @@ to_tsquery('simple', public.unaccent_immutable(:${key}${paramSuffix}Ts)) OR
          public.unaccent_immutable(${fieldReference}::text) ILIKE public.unaccent_immutable(:${key}${paramSuffix}Like)
        )`,
        params: {
          [`${key}${paramSuffix}Ts`]: tsQuery,
          [`${key}${paramSuffix}Like`]: `%${value}%`,
        },
      };
    }
    case 'notContains':
      return {
        sql: `NOT (${fieldReference}::text[] && ARRAY[:...${key}${paramSuffix}]::text[])`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'containsAny':
      return {
        sql: `${fieldReference}::text[] && ARRAY[:...${key}${paramSuffix}]::text[]`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    case 'containsIlike':
      return {
        sql: `EXISTS (SELECT 1 FROM unnest(${fieldReference}) AS elem WHERE elem ILIKE :${key}${paramSuffix})`,
        params: { [`${key}${paramSuffix}`]: value },
      };
    default:
      throw new GraphqlQueryRunnerException(
        `Operator "${operator}" is not supported`,
        GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
  }
};
