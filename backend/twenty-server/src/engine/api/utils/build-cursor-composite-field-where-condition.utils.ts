import {
  FieldMetadataType,
  type ObjectRecord,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type ObjectRecordCursorLeafCompositeValue,
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
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
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
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

  const cursorEntries = compositeFieldProperties
    .map((property) => {
      if (cursorValue[property.name] === undefined) {
        return null;
      }

      return {
        [property.name]: cursorValue[property.name],
      };
    })
    .filter(isDefined);

  if (isEqualityCondition) {
    const result = cursorEntries.reduce<Record<string, ObjectRecordFilter>>(
      (acc, cursorEntry) => {
        const [cursorKey, cursorValue] = Object.entries(cursorEntry)[0];

        return {
          ...acc,
          [cursorKey]: {
            eq: cursorValue,
          },
        };
      },
      {},
    );

    return {
      [fieldKey]: result,
    };
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
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const isAscending = isAscendingOrder(orderByDirection);
      const computedOperator = computeOperator(
        isAscending,
        isForwardPagination,
      );

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
