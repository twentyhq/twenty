import { ObjectLiteral } from 'typeorm';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { formatSearchTerms } from 'src/engine/core-modules/search/utils/format-search-terms';

const FUZZY_SEARCH_SIMILARITY_THRESHOLD = 0.2;

type WhereConditionParts = {
  sql: string;
  params: ObjectLiteral;
};

export const computeWhereConditionParts = (
  operator: string,
  objectNameSingular: string,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): WhereConditionParts => {
  const uuid = Math.random().toString(36).slice(2, 7);

  switch (operator) {
    case 'isEmptyArray':
      return {
        sql: `"${objectNameSingular}"."${key}" = '{}'`,
        params: {},
      };
    case 'eq':
      return {
        sql: `"${objectNameSingular}"."${key}" = :${key}${uuid}`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'neq':
      return {
        sql: `"${objectNameSingular}"."${key}" != :${key}${uuid}`,
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
        sql: `"${objectNameSingular}"."${key}" IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}`,
        params: {},
      };
    case 'like':
      return {
        sql: `"${objectNameSingular}"."${key}"::text LIKE :${key}${uuid}`,
        params: { [`${key}${uuid}`]: `${value}` },
      };
    case 'ilike':
      return {
        sql: `"${objectNameSingular}"."${key}"::text ILIKE :${key}${uuid}`,
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
      if (key === 'searchVector') {
        const searchTerms = formatSearchTerms(value, 'and');

        return {
          sql: `"${objectNameSingular}"."${key}" @@ to_tsquery('simple', :${key}${uuid})`,
          params: { [`${key}${uuid}`]: searchTerms },
        };
      }

      return {
        sql: `"${objectNameSingular}"."${key}" @> ARRAY[:...${key}${uuid}]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'notContains':
      return {
        sql: `NOT ("${objectNameSingular}"."${key}"::text[] && ARRAY[:...${key}${uuid}]::text[])`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsAny':
      if (key === 'searchVector') {
        const searchTerms = formatSearchTerms(value.join(' '), 'or');

        return {
          sql: `"${objectNameSingular}"."${key}" @@ to_tsquery('simple', :${key}${uuid})`,
          params: { [`${key}${uuid}`]: searchTerms },
        };
      }

      return {
        sql: `"${objectNameSingular}"."${key}"::text[] && ARRAY[:...${key}${uuid}]::text[]`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'containsAll': {
      const searchTerms = value
        .map((term: string) => formatSearchTerms(term, 'and'))
        .join(' & ');

      return {
        sql: `"${objectNameSingular}"."${key}" @@ to_tsquery('simple', :${key}${uuid})`,
        params: { [`${key}${uuid}`]: searchTerms },
      };
    }
    case 'containsIlike':
      return {
        sql: `EXISTS (SELECT 1 FROM unnest("${objectNameSingular}"."${key}") AS elem WHERE elem ILIKE :${key}${uuid})`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'matches':
      return {
        sql: `"${objectNameSingular}"."${key}" @@ plainto_tsquery('simple', :${key}${uuid})`,
        params: { [`${key}${uuid}`]: value },
      };
    case 'fuzzy':
      return {
        sql: `similarity("${objectNameSingular}"."${key}"::text, :${key}${uuid}) > ${FUZZY_SEARCH_SIMILARITY_THRESHOLD}`,
        params: { [`${key}${uuid}`]: value },
      };
    default:
      throw new GraphqlQueryRunnerException(
        `Operator "${operator}" is not supported`,
        GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR,
      );
  }
};
