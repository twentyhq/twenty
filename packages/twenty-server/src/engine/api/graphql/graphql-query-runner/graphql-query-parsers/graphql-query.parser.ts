import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';
import { type OrderByWithGroupBy } from 'twenty-shared/types';
import { type FindOptionsWhere, type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderGroupByParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order-group-by.parser';
import {
  GraphqlQueryOrderFieldParser,
  type OrderByClause,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import {
  GraphqlQuerySelectedFieldsParser,
  type GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

export class GraphqlQueryParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private filterConditionParser: GraphqlQueryFilterConditionParser;
  private orderFieldParser: GraphqlQueryOrderFieldParser;
  private orderGroupByParser: GraphqlQueryOrderGroupByParser;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;

    this.filterConditionParser = new GraphqlQueryFilterConditionParser(
      this.flatObjectMetadata,
      this.flatFieldMetadataMaps,
    );
    this.orderFieldParser = new GraphqlQueryOrderFieldParser(
      this.flatObjectMetadata,
      this.flatObjectMetadataMaps,
      this.flatFieldMetadataMaps,
    );
    this.orderGroupByParser = new GraphqlQueryOrderGroupByParser(
      this.flatObjectMetadata,
      this.flatObjectMetadataMaps,
      this.flatFieldMetadataMaps,
    );
  }

  public applyFilterToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    objectNameSingular: string,
    recordFilter: Partial<ObjectRecordFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    return this.filterConditionParser.parse(
      queryBuilder,
      objectNameSingular,
      recordFilter,
    );
  }

  public applyDeletedAtToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    recordFilter: Partial<ObjectRecordFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    if (this.checkForDeletedAtFilter(recordFilter)) {
      queryBuilder.withDeleted();
    }

    return queryBuilder;
  }

  private checkForDeletedAtFilter = (
    filter: FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[],
  ): boolean => {
    if (Array.isArray(filter)) {
      return filter.some((subFilter) =>
        this.checkForDeletedAtFilter(subFilter),
      );
    }

    for (const [key, value] of Object.entries(filter)) {
      if (key === 'deletedAt') {
        return true;
      }

      if (typeof value === 'object' && value !== null) {
        if (
          this.checkForDeletedAtFilter(value as FindOptionsWhere<ObjectLiteral>)
        ) {
          return true;
        }
      }
    }

    return false;
  };

  public applyOrderToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, OrderByClause> {
    const parseResult = this.orderFieldParser.parse(
      orderBy as ObjectRecordOrderBy,
      objectNameSingular,
      isForwardPagination,
    );

    // Note: We use subqueries for relation ordering instead of JOINs
    // This avoids TypeORM's DISTINCT subquery issues with mixed ordering
    // relationJoins is kept for backward compatibility but will be empty

    queryBuilder.orderBy(parseResult.orderBy);

    return parseResult.orderBy;
  }

  // Kept for backward compatibility - no longer needed with subquery approach
  public addRelationOrderColumnsToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _queryBuilder: WorkspaceSelectQueryBuilder<any>,
    _parsedOrderBy: Record<string, OrderByClause>,
    _objectNameSingular: string,
  ): void {
    // No-op: With subquery approach, we don't need to add relation columns
    // Subqueries are self-contained and don't require JOINs or extra SELECTs
  }

  public getOrderByRawSQL(
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): string {
    const parseResult = this.orderFieldParser.parse(
      orderBy as ObjectRecordOrderBy,
      objectNameSingular,
      isForwardPagination,
    );

    const orderByRawSQLClauseArray = Object.entries(parseResult.orderBy).map(
      ([orderByField, orderByCondition]) => {
        const nullsCondition = isDefined(orderByCondition.nulls)
          ? ` ${orderByCondition.nulls}`
          : '';

        let columnExpr: string;

        // Check if it's a subquery (starts with '(')
        if (orderByField.startsWith('(')) {
          // Subquery - use as-is, but apply LOWER if needed
          columnExpr = orderByField;
          if (orderByCondition.castToText) {
            // Wrap subquery result with ::text
            columnExpr = `(${columnExpr})::text`;
          }
          if (orderByCondition.useLower) {
            columnExpr = `LOWER(${columnExpr})`;
          }
        } else {
          // Regular column - convert "alias.column" to quoted SQL identifier
          const parts = orderByField.split('.');
          const quotedColumn =
            parts.length === 2
              ? `"${parts[0]}"."${parts[1]}"`
              : `"${orderByField}"`;

          columnExpr = quotedColumn;

          if (orderByCondition.castToText) {
            columnExpr = `${columnExpr}::text`;
          }
          if (orderByCondition.useLower) {
            columnExpr = `LOWER(${columnExpr})`;
          }
        }

        return `${columnExpr} ${orderByCondition.order}${nullsCondition}`;
      },
    );

    const orderByRawSQLString = orderByRawSQLClauseArray.join(', ');

    const orderByCompleteSQLClause = isNonEmptyString(orderByRawSQLString)
      ? `ORDER BY ${orderByRawSQLString}`
      : '';

    return orderByCompleteSQLClause;
  }

  public applyGroupByOrderToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy,
    groupByFields: GroupByField[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    const parsedOrderBys = this.orderGroupByParser.parse({
      orderBy,
      groupByFields,
    });

    parsedOrderBys.forEach((orderByField, index) => {
      Object.entries(orderByField).forEach(([expression, direction]) => {
        if (index === 0) {
          queryBuilder.orderBy(expression, direction.order, direction.nulls);
        } else {
          queryBuilder.addOrderBy(expression, direction.order, direction.nulls);
        }
      });
    });

    return queryBuilder;
  }

  public parseSelectedFields(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): GraphqlQuerySelectedFieldsResult {
    const selectedFieldsParser = new GraphqlQuerySelectedFieldsParser(
      this.flatObjectMetadataMaps,
      this.flatFieldMetadataMaps,
    );

    return selectedFieldsParser.parse(
      graphqlSelectedFields,
      this.flatObjectMetadata,
    );
  }
}
