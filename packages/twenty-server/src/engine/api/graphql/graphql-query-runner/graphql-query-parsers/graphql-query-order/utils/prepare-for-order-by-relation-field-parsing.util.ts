import { UserInputError } from 'apollo-server-core';
import { isObject } from 'class-validator';
import { type ObjectRecordOrderByForRelationField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type GroupByField,
  type GroupByRelationField,
} from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-field.types';
import { isGroupByRelationField } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/utils/is-group-by-relation-field.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export const prepareForOrderByRelationFieldParsing = ({
  orderByArg,
  fieldMetadata,
  objectMetadataMaps,
  groupByFields,
}: {
  orderByArg: ObjectRecordOrderByForRelationField;
  fieldMetadata: FieldMetadataEntity;
  objectMetadataMaps?: ObjectMetadataMaps;
  groupByFields: GroupByField[];
}) => {
  if (!objectMetadataMaps) {
    throw new UserInputError(
      `Object metadata maps not found for field ${fieldMetadata.name}`,
    );
  }

  const relationFieldName = Object.keys(orderByArg)[0];
  const nestedFieldOrderByObject = orderByArg[relationFieldName];

  if (
    !isDefined(nestedFieldOrderByObject) ||
    !isObject(nestedFieldOrderByObject)
  ) {
    return {};
  }

  if (Object.keys(nestedFieldOrderByObject).length > 1) {
    throw new UserInputError(
      'Please provide nested field criteria one by one in orderBy array',
    );
  }

  const nestedFieldName = Object.keys(nestedFieldOrderByObject)[0];
  const nestedFieldOrderByValue = nestedFieldOrderByObject[nestedFieldName];

  if (!isDefined(nestedFieldOrderByValue)) {
    return {};
  }

  if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
    throw new UserInputError(
      `Relation target object metadata id not found for field ${fieldMetadata.name}`,
    );
  }

  const targetObjectMetadataItem =
    objectMetadataMaps?.byId[fieldMetadata.relationTargetObjectMetadataId];

  if (!isDefined(targetObjectMetadataItem)) {
    throw new UserInputError(
      `Target object metadata item not found for field ${fieldMetadata.name}`,
    );
  }

  const nestedFieldMetadataId =
    targetObjectMetadataItem?.fieldIdByName[nestedFieldName];

  if (!isDefined(nestedFieldMetadataId)) {
    throw new UserInputError(
      `Nested field metadata id not found for field ${nestedFieldName}`,
    );
  }

  const nestedFieldMetadata =
    targetObjectMetadataItem?.fieldsById[nestedFieldMetadataId];

  if (!isDefined(nestedFieldMetadata) || !isDefined(nestedFieldMetadataId)) {
    throw new UserInputError(
      `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadataItem.nameSingular}"`,
    );
  }

  const associatedGroupByField = groupByFields.find(
    (groupByField) =>
      isGroupByRelationField(groupByField) &&
      groupByField.fieldMetadata.id === fieldMetadata.id &&
      groupByField.nestedFieldMetadata.id === nestedFieldMetadataId,
  ) as GroupByRelationField | undefined;

  if (!isDefined(associatedGroupByField)) {
    throw new UserInputError(
      `Cannot order by a relation field that is not in groupBy criteria: ${relationFieldName}.${nestedFieldName}`,
    );
  }

  return {
    associatedGroupByField,
    nestedFieldMetadata,
    nestedFieldOrderByValue,
  };
};
