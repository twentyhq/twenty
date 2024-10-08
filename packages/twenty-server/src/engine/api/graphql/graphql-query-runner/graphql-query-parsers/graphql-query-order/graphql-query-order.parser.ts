import {
  OrderByDirection,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
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
export class GraphqlQueryOrderFieldParser {
  private fieldMetadataMap: FieldMetadataMap;

  constructor(fieldMetadataMap: FieldMetadataMap) {
    this.fieldMetadataMap = fieldMetadataMap;
  }

  parse(
    orderBy: RecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, string> {
    return orderBy.reduce(
      (acc, item) => {
        Object.entries(item).forEach(([key, value]) => {
          const fieldMetadata = this.fieldMetadataMap[key];

          if (!fieldMetadata || value === undefined) {
            throw new GraphqlQueryRunnerException(
              `Field "${key}" does not exist or is not sortable`,
              GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
            );
          }

          if (isCompositeFieldMetadataType(fieldMetadata.type)) {
            const compositeOrder = this.parseCompositeFieldForOrder(
              fieldMetadata,
              value,
              objectNameSingular,
              isForwardPagination,
            );

            Object.assign(acc, compositeOrder);
          } else {
            acc[`"${objectNameSingular}"."${key}"`] =
              this.convertOrderByToFindOptionsOrder(value, isForwardPagination);
          }
        });

        return acc;
      },
      {} as Record<string, string>,
    );
  }

  private parseCompositeFieldForOrder(
    fieldMetadata: FieldMetadataInterface,
    value: any,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, string> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.entries(value).reduce(
      (acc, [subFieldKey, subFieldValue]) => {
        const subFieldMetadata = compositeType.properties.find(
          (property) => property.name === subFieldKey,
        );

        if (!subFieldMetadata) {
          throw new Error(
            `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
          );
        }

        const fullFieldName = `"${objectNameSingular}"."${fieldMetadata.name}${capitalize(subFieldKey)}"`;

        if (!this.isOrderByDirection(subFieldValue)) {
          throw new Error(
            `Sub field order by value must be of type OrderByDirection, but got: ${subFieldValue}`,
          );
        }
        acc[fullFieldName] = this.convertOrderByToFindOptionsOrder(
          subFieldValue,
          isForwardPagination,
        );

        return acc;
      },
      {} as Record<string, string>,
    );
  }

  private convertOrderByToFindOptionsOrder(
    direction: OrderByDirection,
    isForwardPagination = true,
  ): string {
    switch (direction) {
      case OrderByDirection.AscNullsFirst:
        return `${isForwardPagination ? 'ASC' : 'DESC'} NULLS FIRST`;
      case OrderByDirection.AscNullsLast:
        return `${isForwardPagination ? 'ASC' : 'DESC'} NULLS LAST`;
      case OrderByDirection.DescNullsFirst:
        return `${isForwardPagination ? 'DESC' : 'ASC'} NULLS FIRST`;
      case OrderByDirection.DescNullsLast:
        return `${isForwardPagination ? 'DESC' : 'ASC'} NULLS LAST`;
      default:
        throw new GraphqlQueryRunnerException(
          `Invalid direction: ${direction}`,
          GraphqlQueryRunnerExceptionCode.INVALID_DIRECTION,
        );
    }
  }

  private isOrderByDirection(value: unknown): value is OrderByDirection {
    return Object.values(OrderByDirection).includes(value as OrderByDirection);
  }
}
