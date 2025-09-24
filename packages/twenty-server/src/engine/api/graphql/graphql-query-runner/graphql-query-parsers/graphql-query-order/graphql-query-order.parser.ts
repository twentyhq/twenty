import { InternalServerErrorException } from '@nestjs/common';

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
import { ProcessAggregateHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-aggregate.helper';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

type OrderByCondition = {
  order: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export class GraphqlQueryOrderFieldParser {
  private objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;

  constructor(objectMetadataMapItem: ObjectMetadataItemWithFieldMaps) {
    this.objectMetadataMapItem = objectMetadataMapItem;
  }

  parse(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
    isGroupBy = false,
  ): Record<string, OrderByCondition> {
    if (isGroupBy) {
      return this.parseForGroupBy(
        orderBy,
        objectNameSingular,
        isForwardPagination,
      );
    }

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
      {} as Record<string, OrderByCondition>,
    );
  }

  private parseForGroupBy(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): Record<string, OrderByCondition> {
    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(
        Object.values(this.objectMetadataMapItem.fieldsById),
      );

    let orderByExpressionsAndConditions: Record<string, OrderByCondition> = {};

    for (const orderByCondition of orderBy) {
      for (const [aggregatedOrderByCondition, direction] of Object.entries(
        orderByCondition,
      )) {
        const selectedAggregation =
          availableAggregations[aggregatedOrderByCondition];

        if (!selectedAggregation) {
          throw new InternalServerErrorException(
            `Selected aggregation not found for ${aggregatedOrderByCondition}`,
          );
        }

        const expression = ProcessAggregateHelper.getAggregateExpression(
          selectedAggregation,
          objectNameSingular,
        );

        if (!expression) {
          throw new InternalServerErrorException(
            `Aggregate expression not found for ${aggregatedOrderByCondition}`,
          );
        }

        orderByExpressionsAndConditions[expression] =
          this.convertOrderByToFindOptionsOrder(direction, isForwardPagination);
      }
    }

    return orderByExpressionsAndConditions;
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
  ): Record<string, OrderByCondition> {
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
      {} as Record<string, OrderByCondition>,
    );
  }

  private convertOrderByToFindOptionsOrder(
    direction: OrderByDirection,
    isForwardPagination = true,
  ): OrderByCondition {
    switch (direction) {
      case OrderByDirection.AscNullsFirst:
        return {
          order: isForwardPagination ? 'ASC' : 'DESC',
          nulls: 'NULLS FIRST',
        };
      case OrderByDirection.AscNullsLast:
        return {
          order: isForwardPagination ? 'ASC' : 'DESC',
          nulls: 'NULLS LAST',
        };
      case OrderByDirection.DescNullsFirst:
        return {
          order: isForwardPagination ? 'DESC' : 'ASC',
          nulls: 'NULLS FIRST',
        };
      case OrderByDirection.DescNullsLast:
        return {
          order: isForwardPagination ? 'DESC' : 'ASC',
          nulls: 'NULLS LAST',
        };
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
