import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';
import { type OrderByWithGroupBy } from 'twenty-shared/types';
import { type FindOptionsWhere, type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  type CommonSelectedFields,
  type CommonSelectedFieldsResult,
} from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type GroupByField } from 'src/engine/api/common/common-query-runners/types/group-by-field.type';
import { CommonQueryFilterConditionParser } from 'src/engine/api/common/common-query-parsers/common-query-filter/common-query-filter-condition.parser';
import { CommonQueryOrderGroupByParser } from 'src/engine/api/common/common-query-parsers/common-query-order/common-query-order-group-by.parser';
import {
  CommonQueryOrderFieldParser,
  type OrderByClause,
  type RelationJoinInfo,
} from 'src/engine/api/common/common-query-parsers/common-query-order/common-query-order.parser';
import { CommonQuerySelectedFieldsParser } from 'src/engine/api/common/common-query-parsers/common-query-selected-fields/common-selected-fields.parser';
import { addRelationJoinAliasToQueryBuilder } from 'src/engine/api/common/common-query-parsers/utils/add-relation-join-alias.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export class CommonQueryParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  private filterConditionParser: CommonQueryFilterConditionParser;
  private orderFieldParser: CommonQueryOrderFieldParser;
  private orderGroupByParser: CommonQueryOrderGroupByParser;

  constructor({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;

    this.filterConditionParser = new CommonQueryFilterConditionParser({
      flatObjectMetadata: this.flatObjectMetadata,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
    });
    this.orderFieldParser = new CommonQueryOrderFieldParser({
      flatObjectMetadata: this.flatObjectMetadata,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
    });
    this.orderGroupByParser = new CommonQueryOrderGroupByParser({
      flatObjectMetadata: this.flatObjectMetadata,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
    });
  }

  public applyFilterToBuilder({
    queryBuilder,
    objectNameSingular,
    recordFilter,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    recordFilter: Partial<ObjectRecordFilter>;
  }): WorkspaceSelectQueryBuilder {
    return this.filterConditionParser.parse({
      queryBuilder,
      objectNameSingular,
      filter: recordFilter,
    });
  }

  public applyCursorFilterToBuilder({
    queryBuilder,
    objectNameSingular,
    cursorFilter,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    cursorFilter: Partial<ObjectRecordFilter>;
  }): WorkspaceSelectQueryBuilder {
    return this.filterConditionParser.parseCursorFilter({
      queryBuilder,
      objectNameSingular,
      cursorFilter,
    });
  }

  public applyDeletedAtToBuilder({
    queryBuilder,
    recordFilter,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    recordFilter: Partial<ObjectRecordFilter>;
  }): WorkspaceSelectQueryBuilder {
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

      // Only and/or/not are transparent: nested composite or relation deletedAt belongs to another entity and must not widen the root query
      if (
        (key === 'and' || key === 'or' || key === 'not') &&
        typeof value === 'object' &&
        value !== null &&
        this.checkForDeletedAtFilter(value as FindOptionsWhere<ObjectLiteral>)
      ) {
        return true;
      }
    }

    return false;
  };

  public applyOrderToBuilder({
    queryBuilder,
    orderBy,
    objectNameSingular,
    isForwardPagination = true,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy;
    objectNameSingular: string;
    isForwardPagination?: boolean;
  }): Record<string, OrderByClause> {
    const parseResult = this.orderFieldParser.parse({
      orderBy: orderBy as ObjectRecordOrderBy,
      objectNameSingular,
      isForwardPagination,
      recordReadRestrictions: queryBuilder.recordReadRestrictions,
    });

    for (const joinInfo of parseResult.relationJoins) {
      addRelationJoinAliasToQueryBuilder({
        queryBuilder,
        parentAlias: objectNameSingular,
        relationName: joinInfo.joinAlias,
      });
    }

    queryBuilder.orderBy(parseResult.orderBy);

    return parseResult.orderBy;
  }

  public addRelationOrderColumnsToBuilder({
    queryBuilder,
    parsedOrderBy,
    objectNameSingular,
    columnsToSelect,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    parsedOrderBy: Record<string, OrderByClause>;
    objectNameSingular: string;
    columnsToSelect: Record<string, boolean>;
  }): void {
    // Must run after setFindOptions, which clears addSelect; the underscore alias keeps DISTINCT working
    for (const orderByKey of Object.keys(parsedOrderBy)) {
      const parts = orderByKey.split('.');

      if (parts.length === 2) {
        const [alias, column] = parts;

        // Relation columns are never in columnsToSelect
        const isMainEntity = alias === objectNameSingular;
        const isAlreadySelected = isMainEntity && columnsToSelect[column];

        if (!isAlreadySelected) {
          queryBuilder.addSelect(
            `"${alias}"."${column}"`,
            `${alias}_${column}`,
          );
        }
      }
    }
  }

  public getOrderByRawSQL({
    orderBy,
    objectNameSingular,
    isForwardPagination = true,
  }: {
    orderBy: ObjectRecordOrderBy;
    objectNameSingular: string;
    isForwardPagination?: boolean;
  }): { orderByRawSQL: string; relationJoins: RelationJoinInfo[] } {
    const parseResult = this.orderFieldParser.parse({
      orderBy,
      objectNameSingular,
      isForwardPagination,
    });

    const orderByRawSQLClauseArray = Object.entries(parseResult.orderBy).map(
      ([orderByField, orderByCondition]) => {
        const nullsCondition = isDefined(orderByCondition.nulls)
          ? ` ${orderByCondition.nulls}`
          : '';

        const parts = orderByField.split('.');
        const quotedColumn =
          parts.length === 2
            ? `"${parts[0]}"."${parts[1]}"`
            : `"${orderByField}"`;

        let columnExpr = quotedColumn;

        if (orderByCondition.castToText) {
          columnExpr = `${columnExpr}::text`;
        }
        if (orderByCondition.useLower) {
          columnExpr = `LOWER(${columnExpr})`;
        }

        return `${columnExpr} ${orderByCondition.order}${nullsCondition}`;
      },
    );

    const orderByRawSQLString = orderByRawSQLClauseArray.join(', ');

    const orderByRawSQL = isNonEmptyString(orderByRawSQLString)
      ? `ORDER BY ${orderByRawSQLString}`
      : '';

    return { orderByRawSQL, relationJoins: parseResult.relationJoins };
  }

  public applyGroupByOrderToBuilder({
    queryBuilder,
    orderBy,
    groupByFields,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy;
    groupByFields: GroupByField[];
  }): WorkspaceSelectQueryBuilder {
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
    selectedFields: CommonSelectedFields,
  ): CommonSelectedFieldsResult {
    const selectedFieldsParser = new CommonQuerySelectedFieldsParser({
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
    });

    return selectedFieldsParser.parse({
      selectedFields,
      flatObjectMetadata: this.flatObjectMetadata,
    });
  }
}
