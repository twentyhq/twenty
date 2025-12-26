import { isNull } from '@sniptt/guards';
import {
  FieldMetadataType,
  type ObjectRecord,
  OrderByDirection,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { buildCursorCumulativeWhereCondition } from 'src/engine/api/utils/build-cursor-cumulative-where-conditions.utils';
import { computeOperator } from 'src/engine/api/utils/compute-operator.utils';
import { isAscendingOrder } from 'src/engine/api/utils/is-ascending-order.utils';
import { validateAndGetOrderByForCompositeField } from 'src/engine/api/utils/validate-and-get-order-by.utils';

type BuildCursorCompositeFieldWhereConditionParams = {
  fieldType: FieldMetadataType;
  fieldKey: keyof ObjectRecord;
  orderBy: ObjectRecordOrderBy;
  cursorValue: ObjectRecordCursorLeafCompositeValue;
  isForwardPagination: boolean;
  isEqualityCondition?: boolean;
};

const buildNullCompositeFieldFilter = (
  fieldKey: keyof ObjectRecord,
  compositeFieldProperties: Array<{ name: string }>,
): ObjectRecordFilter => {
  const nullFilters = compositeFieldProperties.reduce<
    Record<string, ObjectRecordFilter>
  >(
    (acc, property) => ({
      ...acc,
      [property.name]: { is: 'NULL' },
    }),
    {},
  );

  return { [fieldKey]: nullFilters };
};

const buildAllNullComparisonFilter = (
  fieldKey: keyof ObjectRecord,
  firstProperty: { name: string },
  computedOperator: string,
  orderByDirection: OrderByDirection,
): ObjectRecordFilter | Record<string, never> => {
  if (computedOperator === 'gt') {
    return {
      [fieldKey]: {
        [firstProperty.name]: { is: 'NOT NULL' },
      },
    };
  }

  if (computedOperator === 'lt') {
    const isNullsFirst =
      orderByDirection === OrderByDirection.AscNullsFirst ||
      orderByDirection === OrderByDirection.DescNullsFirst;

    if (isNullsFirst) {
      return {};
    }

    return {
      [fieldKey]: {
        [firstProperty.name]: { is: 'NOT NULL' },
      },
    };
  }

  return {};
};

const shouldIncludeNullsInComparison = (
  computedOperator: string,
  orderByDirection: OrderByDirection,
): boolean => {
  const isNullsFirst =
    orderByDirection === OrderByDirection.AscNullsFirst ||
    orderByDirection === OrderByDirection.DescNullsFirst;

  return (
    (computedOperator === 'lt' && isNullsFirst) ||
    (computedOperator === 'gt' && !isNullsFirst)
  );
};

const buildComparisonFilterWithNulls = (
  fieldKey: keyof ObjectRecord,
  cursorKey: string,
  computedOperator: string,
  cursorValue: unknown,
): ObjectRecordFilter => {
  return {
    or: [
      {
        [fieldKey]: {
          [cursorKey]: {
            [computedOperator]: cursorValue,
          },
        },
      },
      {
        [fieldKey]: {
          [cursorKey]: {
            is: 'NULL',
          },
        },
      },
    ],
  };
};

export const buildCursorCompositeFieldWhereCondition = ({
  fieldType,
  fieldKey,
  orderBy,
  cursorValue,
  isForwardPagination,
  isEqualityCondition = false,
}: BuildCursorCompositeFieldWhereConditionParams): Record<
  string,
  ObjectRecordFilter
> => {
  const compositeType = compositeTypeDefinitions.get(fieldType);

  if (!compositeType) {
    throw new GraphqlQueryRunnerException(
      `Composite type definition not found for type: ${fieldType}`,
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  const fieldOrderBy = validateAndGetOrderByForCompositeField(
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

  const allSubFieldsAreNull = compositeFieldProperties.every((property) =>
    isNull(cursorValue[property.name]),
  );

  if (allSubFieldsAreNull) {
    if (isEqualityCondition) {
      return buildNullCompositeFieldFilter(fieldKey, compositeFieldProperties);
    }

    const firstProperty = compositeFieldProperties[0];
    const firstOrderByDirection = fieldOrderBy[fieldKey]?.[firstProperty.name];

    if (!isDefined(firstOrderByDirection)) {
      return {};
    }

    const isAscending = isAscendingOrder(firstOrderByDirection);
    const computedOperator = computeOperator(isAscending, isForwardPagination);

    return buildAllNullComparisonFilter(
      fieldKey,
      firstProperty,
      computedOperator,
      firstOrderByDirection,
    );
  }

  const cursorEntries = compositeFieldProperties
    .map((property) => {
      if (cursorValue[property.name] === undefined) {
        return null;
      }

      if (isNull(cursorValue[property.name])) {
        return null;
      }

      return {
        [property.name]: cursorValue[property.name],
      };
    })
    .filter(isDefined);

  if (isEqualityCondition) {
    const equalityFilters = cursorEntries.reduce<
      Record<string, ObjectRecordFilter>
    >((acc, cursorEntry) => {
      const [cursorKey, cursorValue] = Object.entries(cursorEntry)[0];

      return {
        ...acc,
        [cursorKey]: { eq: cursorValue },
      };
    }, {});

    return { [fieldKey]: equalityFilters };
  }

  const orConditions = buildCursorCumulativeWhereCondition({
    cursorEntries,
    buildEqualityCondition: ({ cursorKey, cursorValue }) => ({
      [fieldKey]: {
        [cursorKey]: {
          eq: cursorValue,
        },
      },
    }),
    buildMainCondition: ({ cursorKey, cursorValue }) => {
      const orderByDirection = fieldOrderBy[fieldKey]?.[cursorKey];

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
      );

      if (shouldIncludeNullsInComparison(computedOperator, orderByDirection)) {
        return buildComparisonFilterWithNulls(
          fieldKey,
          cursorKey,
          computedOperator,
          cursorValue,
        );
      }

      return {
        [fieldKey]: {
          [cursorKey]: {
            [computedOperator]: cursorValue,
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
