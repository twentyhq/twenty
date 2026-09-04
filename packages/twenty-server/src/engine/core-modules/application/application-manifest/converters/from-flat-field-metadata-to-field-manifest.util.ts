import { type FieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const EMPTY_ACTOR_DEFAULT_VALUE = {
  source: null,
  name: null,
  workspaceMemberId: null,
  context: null,
};

const buildDefaultValue = (flatFieldMetadata: UniversalFlatFieldMetadata) =>
  flatFieldMetadata.type === FieldMetadataType.ACTOR &&
  !isDefined(flatFieldMetadata.defaultValue)
    ? EMPTY_ACTOR_DEFAULT_VALUE
    : flatFieldMetadata.defaultValue;

const buildRelationProperties = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
) => {
  if (
    !isDefined(
      flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
    ) ||
    !isDefined(
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    ) ||
    !isDefined(flatFieldMetadata.universalSettings)
  ) {
    throw new ApplicationException(
      `Relation field "${flatFieldMetadata.name}" is missing its target or settings`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  if (
    flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
    !isDefined(flatFieldMetadata.morphId)
  ) {
    throw new ApplicationException(
      `Morph relation field "${flatFieldMetadata.name}" is missing its morphId`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    relationTargetFieldMetadataUniversalIdentifier:
      flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    universalSettings: flatFieldMetadata.universalSettings,
    ...(flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION
      ? { morphId: flatFieldMetadata.morphId }
      : {}),
  };
};

export const fromFlatFieldMetadataToFieldManifest = ({
  flatFieldMetadata,
}: {
  flatFieldMetadata: UniversalFlatFieldMetadata;
}): FieldManifest => {
  const fieldManifest = {
    universalIdentifier: flatFieldMetadata.universalIdentifier,
    type: flatFieldMetadata.type,
    name: flatFieldMetadata.name,
    label: flatFieldMetadata.label,
    ...(isDefined(flatFieldMetadata.description)
      ? { description: flatFieldMetadata.description }
      : {}),
    ...(isDefined(flatFieldMetadata.icon)
      ? { icon: flatFieldMetadata.icon }
      : {}),
    options: flatFieldMetadata.options,
    defaultValue: buildDefaultValue(flatFieldMetadata),
    isUIEditable: flatFieldMetadata.isUIEditable,
    writability: flatFieldMetadata.writability,
    isNullable: flatFieldMetadata.isNullable,
    isUnique: flatFieldMetadata.isUnique ?? false,
    isLabelSyncedWithName: flatFieldMetadata.isLabelSyncedWithName,
    objectUniversalIdentifier:
      flatFieldMetadata.objectMetadataUniversalIdentifier,
    ...(isMorphOrRelationFieldMetadataType(flatFieldMetadata.type)
      ? buildRelationProperties(flatFieldMetadata)
      : { universalSettings: flatFieldMetadata.universalSettings }),
  };

  return fieldManifest as FieldManifest;
};
