import { ObjectLiteral, WhereExpressionBuilder } from 'typeorm';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { capitalize } from 'src/utils/capitalize';

type WhereConditionParts = {
  sql: string;
  params: ObjectLiteral;
};

type ComparisonOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'is'
  | 'like'
  | 'ilike'
  | 'startsWith'
  | 'endsWith';

export class GraphqlQueryFilterFieldParser {
  private fieldMetadataMap: FieldMetadataMap;

  constructor(fieldMetadataMap: FieldMetadataMap) {
    this.fieldMetadataMap = fieldMetadataMap;
  }

  public parse(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    key: string,
    filterValue: any,
    isFirst = false,
  ): void {
    const fieldMetadata = this.fieldMetadataMap[`${key}`];

    if (!fieldMetadata) {
      throw new Error(`Field metadata not found for field: ${key}`);
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      this.parseCompositeFieldForFilter(
        queryBuilder,
        fieldMetadata,
        objectNameSingular,
        filterValue,
        isFirst,
      );

      return;
    }

    const [operator, value] = this.extractOperatorAndValue(filterValue);

    if (operator === 'in' && (!Array.isArray(value) || value.length === 0)) {
      throw new GraphqlQueryRunnerException(
        `Invalid filter value for field ${key}. Expected non-empty array`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    const { sql, params } = this.computeWhereConditionParts(
      operator,
      objectNameSingular,
      key,
      value,
    );

    this.applyWhereCondition(queryBuilder, sql, params, isFirst);
  }

  private parseCompositeFieldForFilter(
    queryBuilder: WhereExpressionBuilder,
    fieldMetadata: FieldMetadataInterface,
    objectNameSingular: string,
    fieldValue: any,
    isFirst = false,
  ): void {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    Object.entries(fieldValue).forEach(
      ([subFieldKey, subFieldFilter], index) => {
        const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

        const [operator, value] = this.extractOperatorAndValue(
          subFieldFilter as Record<string, any>,
        );
        const { sql, params } = this.computeWhereConditionParts(
          operator,
          objectNameSingular,
          fullFieldName,
          value,
        );

        this.applyWhereCondition(
          queryBuilder,
          sql,
          params,
          isFirst && index === 0,
        );
      },
    );
  }

  private extractOperatorAndValue(filterValue: any): [ComparisonOperator, any] {
    const entries = Object.entries(filterValue);

    if (entries.length !== 1) {
      throw new GraphqlQueryRunnerException(
        'Invalid filter value. Expected exactly one operator-value pair.',
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
      );
    }

    return entries[0] as [ComparisonOperator, any];
  }

  private applyWhereCondition(
    queryBuilder: WhereExpressionBuilder,
    sql: string,
    params: ObjectLiteral,
    isFirst: boolean,
  ): void {
    if (isFirst) {
      queryBuilder.where(sql, params);
    } else {
      queryBuilder.andWhere(sql, params);
    }
  }

  private computeWhereConditionParts(
    operator: ComparisonOperator,
    objectNameSingular: string,
    key: string,
    value: any,
  ): WhereConditionParts {
    const uuid = Math.random().toString(36).slice(2, 7);
    const paramKey = `${key}${uuid}`;
    const columnName = `${objectNameSingular}.${key}`;

    const operatorMap: Record<
      ComparisonOperator,
      (columnName: string, paramKey: string) => WhereConditionParts
    > = {
      eq: (col, param) => ({
        sql: `${col} = :${param}`,
        params: { [param]: value },
      }),
      neq: (col, param) => ({
        sql: `${col} != :${param}`,
        params: { [param]: value },
      }),
      gt: (col, param) => ({
        sql: `${col} > :${param}`,
        params: { [param]: value },
      }),
      gte: (col, param) => ({
        sql: `${col} >= :${param}`,
        params: { [param]: value },
      }),
      lt: (col, param) => ({
        sql: `${col} < :${param}`,
        params: { [param]: value },
      }),
      lte: (col, param) => ({
        sql: `${col} <= :${param}`,
        params: { [param]: value },
      }),
      in: (col, param) => ({
        sql: `${col} IN (:...${param})`,
        params: { [param]: value },
      }),
      is: (col) => ({
        sql: `${col} IS ${value === 'NULL' ? 'NULL' : 'NOT NULL'}`,
        params: {},
      }),
      like: (col, param) => ({
        sql: `${col} LIKE :${param}`,
        params: { [param]: value },
      }),
      ilike: (col, param) => ({
        sql: `${col} ILIKE :${param}`,
        params: { [param]: value },
      }),
      startsWith: (col, param) => ({
        sql: `${col} LIKE :${param}`,
        params: { [param]: `${value}%` },
      }),
      endsWith: (col, param) => ({
        sql: `${col} LIKE :${param}`,
        params: { [param]: `%${value}` },
      }),
    };

    const operatorFunction = operatorMap[operator];

    if (!operatorFunction) {
      throw new GraphqlQueryRunnerException(
        `Operator "${operator}" is not supported`,
        GraphqlQueryRunnerExceptionCode.UNSUPPORTED_OPERATOR,
      );
    }

    return operatorFunction(columnName, paramKey);
  }
}
