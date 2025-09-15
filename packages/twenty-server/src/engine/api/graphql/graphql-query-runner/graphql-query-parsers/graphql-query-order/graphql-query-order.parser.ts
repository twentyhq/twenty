import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import {
  type ObjectRecordOrderBy,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export class GraphqlQueryOrderFieldParser {
  private objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;

  constructor(objectMetadataMapItem: ObjectMetadataItemWithFieldMaps) {
    this.objectMetadataMapItem = objectMetadataMapItem;
  }

  parse(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, string> {
    return orderBy.reduce(
      (acc, item) => {
        Object.entries(item).forEach(([key, value]) => {
          const fieldMetadataId = this.objectMetadataMapItem.fieldIdByName[key];
          const fieldMetadata =
            this.objectMetadataMapItem.fieldsById[fieldMetadataId];

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
            const orderByCasting =
              this.getOptionalOrderByCasting(fieldMetadata);

            acc[`"${objectNameSingular}"."${key}"${orderByCasting}`] =
              this.convertOrderByToFindOptionsOrder(
                value as OrderByDirection,
                isForwardPagination,
              );
          }
        });

        return acc;
      },
      {} as Record<string, string>,
    );
  }

  private getOptionalOrderByCasting(
    fieldMetadata: Pick<FieldMetadataEntity, 'type'>,
  ): string {
    if (
      fieldMetadata.type === FieldMetadataType.SELECT ||
      fieldMetadata.type === FieldMetadataType.MULTI_SELECT
    ) {
      return '::text';
    }

    return '';
  }

  private parseCompositeFieldForOrder(
    fieldMetadata: FieldMetadataEntity,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
