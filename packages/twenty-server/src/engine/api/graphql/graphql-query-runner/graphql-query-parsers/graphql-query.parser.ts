import {
  FindOptionsWhere,
  ObjectLiteral,
  OrderByCondition,
  SelectQueryBuilder,
} from 'typeorm';

import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { GraphqlQueryFilterConditionParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import {
  GraphqlQuerySelectedFieldsParser,
  GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';

export class GraphqlQueryParser {
  private fieldMetadataMapByName: FieldMetadataMap;
  private fieldMetadataMapByJoinColumnName: FieldMetadataMap;
  private objectMetadataMaps: ObjectMetadataMaps;
  private filterConditionParser: GraphqlQueryFilterConditionParser;
  private orderFieldParser: GraphqlQueryOrderFieldParser;

  constructor(
    fieldMetadataMapByName: FieldMetadataMap,
    fieldMetadataMapByJoinColumnName: FieldMetadataMap,
    objectMetadataMaps: ObjectMetadataMaps,
  ) {
    this.objectMetadataMaps = objectMetadataMaps;
    this.fieldMetadataMapByName = fieldMetadataMapByName;
    this.fieldMetadataMapByJoinColumnName = fieldMetadataMapByJoinColumnName;
    this.filterConditionParser = new GraphqlQueryFilterConditionParser(
      this.fieldMetadataMapByName,
      this.fieldMetadataMapByJoinColumnName,
    );
    this.orderFieldParser = new GraphqlQueryOrderFieldParser(
      this.fieldMetadataMapByName,
    );
  }

  public applyFilterToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: SelectQueryBuilder<any>,
    objectNameSingular: string,
    recordFilter: Partial<ObjectRecordFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any> {
    return this.filterConditionParser.parse(
      queryBuilder,
      objectNameSingular,
      recordFilter,
    );
  }

  public applyDeletedAtToBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: SelectQueryBuilder<any>,
    recordFilter: Partial<ObjectRecordFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: SelectQueryBuilder<any>,
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any> {
    const parsedOrderBys = this.orderFieldParser.parse(
      orderBy,
      objectNameSingular,
      isForwardPagination,
    );

    return queryBuilder.orderBy(parsedOrderBys as OrderByCondition);
  }

  public parseSelectedFields(
    parentObjectMetadata: ObjectMetadataItemWithFieldMaps,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): GraphqlQuerySelectedFieldsResult {
    const parentFields = getObjectMetadataMapItemByNameSingular(
      this.objectMetadataMaps,
      parentObjectMetadata.nameSingular,
    )?.fieldsByName;

    if (!parentFields) {
      throw new GraphqlQueryRunnerException(
        `Could not find object metadata for ${parentObjectMetadata.nameSingular}`,
        GraphqlQueryRunnerExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const selectedFieldsParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
    );

    return selectedFieldsParser.parse(graphqlSelectedFields, parentFields);
  }
}
