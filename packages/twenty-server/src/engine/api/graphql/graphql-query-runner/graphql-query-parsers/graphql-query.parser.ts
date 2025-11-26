import { type OrderByWithGroupBy } from 'twenty-shared/types';
import { type FindOptionsWhere, type ObjectLiteral } from 'typeorm';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import {
  GraphqlQuerySelectedFieldsParser,
  type GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { type GroupByField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

export class GraphqlQueryParser {
  private objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  private objectMetadataMaps: ObjectMetadataMaps;
  private filterConditionParser: GraphqlQueryFilterConditionParser;
  private orderFieldParser: GraphqlQueryOrderFieldParser;

  constructor(
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    objectMetadataMaps: ObjectMetadataMaps,
  ) {
    this.objectMetadataMapItem = objectMetadataMapItem;
    this.objectMetadataMaps = objectMetadataMaps;

    this.filterConditionParser = new GraphqlQueryFilterConditionParser(
      this.objectMetadataMapItem,
    );
    this.orderFieldParser = new GraphqlQueryOrderFieldParser(
      this.objectMetadataMapItem,
      this.objectMetadataMaps,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    const parsedOrderBys = this.orderFieldParser.parse(
      orderBy as ObjectRecordOrderBy,
      objectNameSingular,
      isForwardPagination,
    );

    return queryBuilder.orderBy(parsedOrderBys);
  }

  public applyGroupByOrderToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    orderBy: ObjectRecordOrderBy | OrderByWithGroupBy,
    groupByFields: GroupByField[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    const parsedOrderBys = this.orderFieldParser.parseForGroupBy({
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
    const objectMetadataMapItem = getObjectMetadataMapItemByNameSingular(
      this.objectMetadataMaps,
      this.objectMetadataMapItem.nameSingular,
    );

    if (!objectMetadataMapItem) {
      throw new GraphqlQueryRunnerException(
        `Could not find object metadata for ${this.objectMetadataMapItem.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const selectedFieldsParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
    );

    return selectedFieldsParser.parse(
      graphqlSelectedFields,
      this.objectMetadataMapItem,
      this.objectMetadataMaps,
    );
  }
}
