import {
  FieldMetadataType,
  type ObjectRecord,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForScalarField,
  OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

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
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!isOrderByForScalarField(keyOrderBy, key)) {
    throw new GraphqlQueryRunnerException(
      'Expected non-composite field order by',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
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
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  if (!isOrderByForCompositeField(keyOrderBy, key)) {
    throw new GraphqlQueryRunnerException(
      'Expected composite field order by',
      GraphqlQueryRunnerExceptionCode.INVALID_CURSOR,
      { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
    );
  }

  return keyOrderBy;
};

export const countRelationFieldsInOrderBy = (
  orderBy: ObjectRecordOrderBy,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  fieldIdByName: Record<string, string>,
): number => {
  return orderBy.filter((orderByItem) => {
    const fieldName = Object.keys(orderByItem)[0];
    const fieldMetadataId = fieldIdByName[fieldName];
    const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

    return fieldMetadata?.type === FieldMetadataType.RELATION;
  }).length;
};

export const hasRelationFieldInOrderBy = (
  orderBy: ObjectRecordOrderBy,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  fieldIdByName: Record<string, string>,
): boolean => {
  return (
    countRelationFieldsInOrderBy(
      orderBy,
      flatFieldMetadataMaps,
      fieldIdByName,
    ) > 0
  );
};
