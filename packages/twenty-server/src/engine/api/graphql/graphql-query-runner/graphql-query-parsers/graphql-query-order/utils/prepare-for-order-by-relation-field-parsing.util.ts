import { isObject } from 'class-validator';
import { type ObjectRecordOrderByForRelationField } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type GroupByField,
  type GroupByRelationField,
} from 'src/engine/api/common/common-query-runners/types/group-by-field.types';
import { isGroupByRelationField } from 'src/engine/api/common/common-query-runners/utils/is-group-by-relation-field.util';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const prepareForOrderByRelationFieldParsing = ({
  orderByArg,
  fieldMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  groupByFields,
}: {
  orderByArg: ObjectRecordOrderByForRelationField;
  fieldMetadata: FlatFieldMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  groupByFields: GroupByField[];
}) => {
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

  const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(targetObjectMetadata)) {
    throw new UserInputError(
      `Target object metadata item not found for field ${fieldMetadata.name}`,
    );
  }

  const { fieldIdByName: targetFieldIdByName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      targetObjectMetadata,
    );

  const nestedFieldMetadataId = targetFieldIdByName[nestedFieldName];

  if (!isDefined(nestedFieldMetadataId)) {
    throw new UserInputError(
      `Nested field metadata id not found for field ${nestedFieldName}`,
    );
  }

  const nestedFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: nestedFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });

  if (!isDefined(nestedFieldMetadata) || !isDefined(nestedFieldMetadataId)) {
    throw new UserInputError(
      `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
    );
  }

  let compositeSubFieldName: string | undefined;

  if (
    isCompositeFieldMetadataType(nestedFieldMetadata.type) &&
    isObject(nestedFieldOrderByValue)
  ) {
    const compositeSubFields = Object.keys(nestedFieldOrderByValue);

    if (compositeSubFields.length === 1) {
      compositeSubFieldName = compositeSubFields[0];
    }
  }

  const associatedGroupByField = groupByFields.find((groupByField) => {
    if (!isGroupByRelationField(groupByField)) {
      return false;
    }

    if (groupByField.fieldMetadata.id !== fieldMetadata.id) {
      return false;
    }

    if (groupByField.nestedFieldMetadata.id !== nestedFieldMetadataId) {
      return false;
    }

    if (isDefined(compositeSubFieldName)) {
      return groupByField.nestedSubFieldName === compositeSubFieldName;
    }

    return true;
  }) as GroupByRelationField | undefined;

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
