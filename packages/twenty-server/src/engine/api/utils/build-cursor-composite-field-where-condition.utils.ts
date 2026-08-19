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
import {
  buildCursorKeysetCondition,
  checkIfColumnHasNullEquivalentDefault,
} from 'src/engine/api/utils/build-cursor-keyset-condition.utils';
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
}: BuildCursorCompositeFieldWhereConditionParams): ObjectRecordFilter | null => {
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

  const cursorEntries = compositeType.properties
    .filter(
      (property) =>
        property.type !== FieldMetadataType.RAW_JSON &&
        cursorValue[property.name] !== undefined,
    )
    .map((property) => ({ [property.name]: cursorValue[property.name] }));

  if (cursorEntries.length === 0) {
    return null;
  }

  const buildSubFieldKeysetParams = (
    cursorKey: string,
    subFieldValue: unknown,
  ) => {
    const orderByDirection = fieldOrderBy[fieldKey]?.[cursorKey];

    if (!isDefined(orderByDirection)) {
      throw new GraphqlQueryRunnerException(
        'Invalid cursor',
        GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    return {
      cursorValue: subFieldValue,
      orderByDirection,
      isForwardPagination,
      canFieldHoldNullValue: !checkIfColumnHasNullEquivalentDefault(
        fieldType,
        cursorKey,
      ),
      buildLeafCondition: (leafFilter: Record<string, unknown>) => ({
        [fieldKey]: { [cursorKey]: leafFilter },
      }),
    };
  };

  if (isEqualityCondition) {
    const result = cursorEntries.reduce<Record<string, unknown>>(
      (acc, cursorEntry) => {
        const [cursorKey, subFieldValue] = Object.entries(cursorEntry)[0];

        return {
          ...acc,
          [cursorKey]:
            subFieldValue === null ? { is: 'NULL' } : { eq: subFieldValue },
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
    buildEqualityCondition: ({ cursorKey, cursorValue: subFieldValue }) =>
      buildCursorKeysetCondition({
        ...buildSubFieldKeysetParams(cursorKey, subFieldValue),
        isEqualityCondition: true,
      }),
    buildMainCondition: ({ cursorKey, cursorValue: subFieldValue }) =>
      buildCursorKeysetCondition({
        ...buildSubFieldKeysetParams(cursorKey, subFieldValue),
        isEqualityCondition: false,
      }),
  });

  if (orConditions.length === 0) {
    return null;
  }

  if (orConditions.length === 1) {
    return orConditions[0];
  }

  return {
    or: orConditions,
  };
};
