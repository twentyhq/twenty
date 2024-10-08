import {
  FindOptionsWhere,
  ObjectLiteral,
  OrderByCondition,
  SelectQueryBuilder,
} from 'typeorm';

import {
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  FieldMetadataMap,
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export class GraphqlQueryParser {
  private fieldMetadataMap: FieldMetadataMap;
  private objectMetadataMap: ObjectMetadataMap;
  private filterConditionParser: GraphqlQueryFilterConditionParser;
  private orderFieldParser: GraphqlQueryOrderFieldParser;

  constructor(
    fieldMetadataMap: FieldMetadataMap,
    objectMetadataMap: ObjectMetadataMap,
  ) {
    this.objectMetadataMap = objectMetadataMap;
    this.fieldMetadataMap = fieldMetadataMap;
    this.filterConditionParser = new GraphqlQueryFilterConditionParser(
      this.fieldMetadataMap,
    );
    this.orderFieldParser = new GraphqlQueryOrderFieldParser(
      this.fieldMetadataMap,
    );
  }

  public applyFilterToBuilder(
    queryBuilder: SelectQueryBuilder<any>,
    objectNameSingular: string,
    recordFilter: Partial<RecordFilter>,
  ): SelectQueryBuilder<any> {
    return this.filterConditionParser.parse(
      queryBuilder,
      objectNameSingular,
      recordFilter,
    );
  }

  public applyDeletedAtToBuilder(
    queryBuilder: SelectQueryBuilder<any>,
    recordFilter: RecordFilter,
  ): SelectQueryBuilder<any> {
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
    queryBuilder: SelectQueryBuilder<any>,
    orderBy: RecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): SelectQueryBuilder<any> {
    const parsedOrderBys = this.orderFieldParser.parse(
      orderBy,
      objectNameSingular,
      isForwardPagination,
    );

    return queryBuilder.orderBy(parsedOrderBys as OrderByCondition);
  }

  public parseSelectedFields(
    parentObjectMetadata: ObjectMetadataMapItem,
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): { select: Record<string, any>; relations: Record<string, any> } {
    const parentFields =
      this.objectMetadataMap[parentObjectMetadata.nameSingular]?.fields;

    if (!parentFields) {
      throw new Error(
        `Could not find object metadata for ${parentObjectMetadata.nameSingular}`,
      );
    }

    const selectedFieldsParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMap,
    );

    return selectedFieldsParser.parse(graphqlSelectedFields, parentFields);
  }
}
