import { isDefined } from 'twenty-shared/utils';

import {
  ObjectRecord,
  ObjectRecordOrderBy,
  ObjectRecordOrderByForCompositeField,
  ObjectRecordOrderByForScalarField,
  OrderByDirection,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';

const isOrderByDirection = (value: unknown): value is OrderByDirection => {
  return Object.values(OrderByDirection).includes(value as OrderByDirection);
};

const isOrderByForScalarField = (
  orderByLeaf: Record<string, unknown>,
  key: keyof ObjectRecord,
): orderByLeaf is ObjectRecordOrderByForScalarField => {
  const value = orderByLeaf[key as string];

  return isDefined(value) && isOrderByDirection(value);
};

const isOrderByForCompositeField = (
  orderByLeaf: Record<string, unknown>,
  key: keyof ObjectRecord,
): orderByLeaf is ObjectRecordOrderByForCompositeField => {
  const value = orderByLeaf[key as string];

  return (
    isDefined(value) &&
    typeof value === 'object' &&
    value !== null &&
    !isOrderByDirection(value) &&
    Object.values(value as Record<string, unknown>).every(isOrderByDirection)
  );
};

export const validateAndGetOrderByForScalarField = (
  key: keyof ObjectRecord,
  orderBy: ObjectRecordOrderBy,
): ObjectRecordOrderByForScalarField => {
  const keyOrderBy = orderBy.find((order) => key in order);

  if (!isDefined(keyOrderBy)) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  if (!isOrderByForScalarField(keyOrderBy, key)) {
    throw new GraphqlQueryRunnerException(
      'Expected non-composite field order by',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  return keyOrderBy;
};

export const validateAndGetOrderByForCompositeField = (
  key: keyof ObjectRecord,
  orderBy: ObjectRecordOrderBy,
): ObjectRecordOrderByForCompositeField => {
  const keyOrderBy = orderBy.find((order) => key in order);

  if (!isDefined(keyOrderBy)) {
    throw new GraphqlQueryRunnerException(
      'Invalid cursor',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  if (!isOrderByForCompositeField(keyOrderBy, key)) {
    throw new GraphqlQueryRunnerException(
      'Expected composite field order by',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
    );
  }

  return keyOrderBy;
};
