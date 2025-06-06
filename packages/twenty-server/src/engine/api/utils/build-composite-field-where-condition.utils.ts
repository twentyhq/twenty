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
}): Record<string, Partial<ObjectRecordFilter>> => {
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

  if (operator === 'eq') {
    const result: Record<string, Partial<ObjectRecordFilter>> = {};

    compositeFieldProperties.forEach((property) => {
      result[fieldKey] = {
        ...result[fieldKey],
        [property.name]: {
          eq: cursorValue[property.name],
        },
      };
    });

    return result;
  }

  if (compositeFieldProperties.length === 0) {
    return {};
  }

  if (compositeFieldProperties.length === 1) {
    const property = compositeFieldProperties[0];
    const fieldOrder = fieldOrderBy[fieldKey];

    const orderByDirection = fieldOrder?.[property.name];

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
        [property.name]: {
          [computedOperator]: cursorValue[property.name],
        },
      },
    };
  }

  const orConditions: Partial<ObjectRecordFilter>[] = [];

  for (const [index, currentProperty] of compositeFieldProperties.entries()) {
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

    if (index === 0) {
      orConditions.push({
        [fieldKey]: {
          [currentProperty.name]: {
            [computedOperator]: cursorValue[currentProperty.name],
          },
        },
      });
    } else {
      const andConditions: Partial<ObjectRecordFilter>[] = [];

      const previousProperties = compositeFieldProperties.slice(0, index);

      for (const previousProperty of previousProperties) {
        andConditions.push({
          [fieldKey]: {
            [previousProperty.name]: {
              eq: cursorValue[previousProperty.name],
            },
          },
        });
      }

      andConditions.push({
        [fieldKey]: {
          [currentProperty.name]: {
            [computedOperator]: cursorValue[currentProperty.name],
          },
        },
      });

      orConditions.push({
        and: andConditions,
      });
    }
  }

  return {
    or: orConditions,
  };
};
