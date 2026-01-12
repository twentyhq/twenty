import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type OrderByClause } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/graphql-query-order.parser';
import {
  buildOrderByColumnExpression,
  shouldCastToText,
  shouldUseCaseInsensitiveOrder,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const parseCompositeFieldForOrder = (
  fieldMetadata: FlatFieldMetadata,
  value: Record<string, unknown>,
  prefix: string,
  isForwardPagination = true,
): Record<string, OrderByClause> => {
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

      const orderByKey = buildOrderByColumnExpression(
        prefix,
        `${fieldMetadata.name}${capitalize(subFieldKey)}`,
      );

      if (!isOrderByDirection(subFieldValue)) {
        throw new Error(
          `Sub field order by value must be of type OrderByDirection, but got: ${subFieldValue}`,
        );
      }

      acc[orderByKey] = {
        ...convertOrderByToFindOptionsOrder(subFieldValue, isForwardPagination),
        useLower: shouldUseCaseInsensitiveOrder(subFieldMetadata.type),
        castToText: shouldCastToText(subFieldMetadata.type),
      };

      return acc;
    },
    {} as Record<string, OrderByClause>,
  );
};
