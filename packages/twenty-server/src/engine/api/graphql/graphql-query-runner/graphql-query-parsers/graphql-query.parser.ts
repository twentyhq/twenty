import {
  FindOptionsOrderValue,
  FindOptionsWhere,
  IsNull,
  ObjectLiteral,
} from 'typeorm';

import {
  RecordFilter,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { GraphqlQueryFilterConditionParser as GraphqlQueryFilterParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-filter/graphql-query-filter-condition.parser';
import { GraphqlQueryOrderFieldParser as GraphqlQueryOrderParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  FieldMetadataMap,
  ObjectMetadataMap,
} from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';

export class GraphqlQueryParser {
  private fieldMetadataMap: FieldMetadataMap;
  private objectMetadataMap: ObjectMetadataMap;

  constructor(
    fieldMetadataMap: FieldMetadataMap,
    objectMetadataMap: ObjectMetadataMap,
  ) {
    this.objectMetadataMap = objectMetadataMap;
    this.fieldMetadataMap = fieldMetadataMap;
  }

  parseFilter(
    recordFilter: RecordFilter,
  ): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] {
    const graphqlQueryFilterParser = new GraphqlQueryFilterParser(
      this.fieldMetadataMap,
    );

    const filters = graphqlQueryFilterParser.parse(recordFilter);

    if (!('deletedAt' in this.fieldMetadataMap)) {
      return filters;
    }

    if (Array.isArray(filters)) {
      return filters.map(this.addDefaultSoftDeleteCondition);
    }

    return this.addDefaultSoftDeleteCondition(filters);
  }

  addDefaultSoftDeleteCondition(
    filters:
      | FindOptionsWhere<ObjectLiteral>
      | FindOptionsWhere<ObjectLiteral>[],
  ): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] {
    if (!('deletedAt' in filters)) {
      return { ...filters, deletedAt: IsNull() };
    }

    return filters;
  }

  parseOrder(
    orderBy: RecordOrderBy,
    isForwardPagination = true,
  ): Record<string, FindOptionsOrderValue> {
    const graphqlQueryOrderParser = new GraphqlQueryOrderParser(
      this.fieldMetadataMap,
    );

    return graphqlQueryOrderParser.parse(orderBy, isForwardPagination);
  }

  parseSelectedFields(
    parentObjectMetadata: ObjectMetadataInterface,
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
