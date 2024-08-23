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

export const parseOrder = (
  orderBy: RecordOrderBy,
  fieldMetadataMap: Map<string, FieldMetadataInterface>,
): Record<string, FindOptionsOrderValue> => {
  return orderBy.reduce(
    (acc, item) => {
      Object.entries(item).forEach(([key, value]) => {
        const fieldMetadata = fieldMetadataMap.get(key);

        if (!fieldMetadata || value === undefined) return;

        if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          const compositeOrder = handleCompositeFieldForOrder(
            fieldMetadata,
            value,
          );

          Object.assign(acc, compositeOrder);
        } else {
          acc[key] = parseOrderBy(value);
        }
      });

      return acc;
    },
    {} as Record<string, FindOptionsOrderValue>,
  );
};

const handleCompositeFieldForOrder = (
  fieldMetadata: FieldMetadataInterface,
  value: any,
): Record<string, FindOptionsOrderValue> => {
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

      acc[fullFieldName] = parseOrderBy(subFieldValue as OrderByDirection);

      return acc;
    },
    {} as Record<string, FindOptionsOrderValue>,
  );
};

const parseOrderBy = (direction: OrderByDirection): FindOptionsOrderValue => {
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
};
