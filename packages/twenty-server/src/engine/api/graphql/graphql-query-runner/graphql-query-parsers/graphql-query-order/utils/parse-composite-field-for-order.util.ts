import {
  OrderByDirection,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type OrderByCondition } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export const parseCompositeFieldForOrder = (
  fieldMetadata: FlatFieldMetadata,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  objectNameSingular: string,
  isForwardPagination = true,
): Record<string, OrderByCondition> => {
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

      if (!isOrderByDirection(subFieldValue)) {
        throw new Error(
          `Sub field order by value must be of type OrderByDirection, but got: ${subFieldValue}`,
        );
      }
      acc[fullFieldName] = convertOrderByToFindOptionsOrder(
        subFieldValue,
        isForwardPagination,
      );

      return acc;
    },
    {} as Record<string, OrderByCondition>,
  );
};

const isOrderByDirection = (value: unknown): value is OrderByDirection => {
  return Object.values(OrderByDirection).includes(value as OrderByDirection);
};
