import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecord,
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildCumulativeConditions } from 'src/engine/api/utils/build-cumulative-conditions.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForCompositeFields } from 'src/engine/api/utils/validate-and-get-order-by.utils';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';

export const buildCompositeFieldWhereCondition = ({
  fieldType,
  fieldKey,
  orderBy,
  cursorValue,
  isForwardPagination,
  operator,
}: {
  fieldType: FieldMetadataType;
  fieldKey: keyof ObjectRecord;
  orderBy: ObjectRecordOrderBy;
  cursorValue: Record<string, unknown>;
  isForwardPagination: boolean;
  operator?: string;
}): Record<string, ObjectRecordFilter> => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new GraphqlQueryRunnerException(
      `Composite type definition not found for type: ${fieldType}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const fieldOrderBy = validateAndGetOrderByForCompositeFields(
    fieldKey,
    orderBy,
  );

  const compositeFieldProperties = compositeType.properties.filter(
    (property) =>
      property.type !== FieldMetadataType.RAW_JSON &&
      cursorValue[property.name] !== undefined,
  );

  if (compositeFieldProperties.length === 0) {
    return {};
  }

  if (operator === 'eq') {
    const result: Record<string, Partial<ObjectRecordFilter>> = {};

    for (const property of compositeFieldProperties) {
      result[fieldKey] = {
        ...result[fieldKey],
        [property.name]: {
          eq: cursorValue[property.name],
        },
      };
    }

    return result;
  }

  const orConditions = buildCumulativeConditions({
    items: compositeFieldProperties,
    buildEqualityCondition: (property) => ({
      [fieldKey]: {
        [property.name]: {
          eq: cursorValue[property.name],
        },
      },
    }),
    buildMainCondition: (currentProperty) => {
      const orderByDirection = fieldOrderBy[fieldKey]?.[currentProperty.name];

      if (!isDefined(orderByDirection)) {
        throw new GraphqlQueryRunnerException(
          'Invalid cursor',
          GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
        );
      }

      const isAscending = isAscendingOrder(orderByDirection);
      const computedOperator = computeOperator(
        isAscending,
        isForwardPagination,
        operator,
      );

      return {
        [fieldKey]: {
          [currentProperty.name]: {
            [computedOperator]: cursorValue[currentProperty.name],
          },
        },
      };
    },
  });

  if (orConditions.length === 1) {
    return orConditions[0];
  }

  return {
    or: orConditions,
  };
};
