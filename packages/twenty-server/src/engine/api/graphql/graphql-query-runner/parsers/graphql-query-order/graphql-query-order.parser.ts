import { FindOptionsOrderValue } from 'typeorm';

import {
  OrderByDirection,
  RecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { capitalize } from 'src/utils/capitalize';

export class GraphqlQueryOrderFieldParser {
  private fieldMetadataMap: Map<string, FieldMetadataInterface>;

  constructor(fieldMetadataMap: Map<string, FieldMetadataInterface>) {
    this.fieldMetadataMap = fieldMetadataMap;
  }

  /**
   * Parses the provided `RecordOrderBy` object and converts it to a `Record<string, FindOptionsOrderValue>` format that can be used with TypeORM's `FindOptions`.
   * Handles both simple and composite field orders, recursively parsing composite fields.
   *
   * @param orderBy - The `RecordOrderBy` object to parse.
   * @returns A `Record<string, FindOptionsOrderValue>` representing the parsed order by information.
   */
  parse(orderBy: RecordOrderBy): Record<string, FindOptionsOrderValue> {
    return orderBy.reduce(
      (acc, item) => {
        Object.entries(item).forEach(([key, value]) => {
          const fieldMetadata = this.fieldMetadataMap.get(key);

          if (!fieldMetadata || value === undefined) return;

          if (isCompositeFieldMetadataType(fieldMetadata.type)) {
            const compositeOrder = this.handleCompositeFieldForOrder(
              fieldMetadata,
              value,
            );

            Object.assign(acc, compositeOrder);
          } else {
            acc[key] = this.convertOrderByToFindOptionsOrder(value);
          }
        });

        return acc;
      },
      {} as Record<string, FindOptionsOrderValue>,
    );
  }

  /**
   * Handles the order by logic for composite fields in the GraphQL query.
   * Recursively parses the composite field order by information and converts it to a format that can be used with TypeORM's `FindOptions`.
   *
   * @param fieldMetadata - The metadata for the composite field.
   * @param value - The order by value for the composite field.
   * @returns A `Record<string, FindOptionsOrderValue>` representing the parsed order by information for the composite field.
   */
  private handleCompositeFieldForOrder(
    fieldMetadata: FieldMetadataInterface,
    value: any,
  ): Record<string, FindOptionsOrderValue> {
    const compositeType = compositeTypeDefintions.get(
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

        const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

        acc[fullFieldName] = this.convertOrderByToFindOptionsOrder(
          subFieldValue as OrderByDirection,
        );

        return acc;
      },
      {} as Record<string, FindOptionsOrderValue>,
    );
  }

  /**
   * Converts an `OrderByDirection` enum value to a `FindOptionsOrderValue` object that can be used with TypeORM's `FindOptions`.
   *
   * @param direction - The `OrderByDirection` enum value to convert.
   * @returns A `FindOptionsOrderValue` object representing the converted order by direction.
   * @throws Error if the provided `direction` is unknown.
   */
  private convertOrderByToFindOptionsOrder(
    direction: OrderByDirection,
  ): FindOptionsOrderValue {
    switch (direction) {
      case OrderByDirection.AscNullsFirst:
        return { direction: 'ASC', nulls: 'FIRST' };
      case OrderByDirection.AscNullsLast:
        return { direction: 'ASC', nulls: 'LAST' };
      case OrderByDirection.DescNullsFirst:
        return { direction: 'DESC', nulls: 'FIRST' };
      case OrderByDirection.DescNullsLast:
        return { direction: 'DESC', nulls: 'LAST' };
      default:
        throw new Error(`Unknown order by direction: ${direction}`);
    }
  }
}
