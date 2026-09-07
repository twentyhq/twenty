import { type FieldManifest } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  getUnsupportedRelationFieldReason,
  isExportableRelationFlatFieldMetadata,
} from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-relation-field-reason.util';
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
  if (!isExportableRelationFlatFieldMetadata(flatFieldMetadata)) {
    throw new ApplicationException(
      `Relation field "${flatFieldMetadata.name}" cannot be exported: ${getUnsupportedRelationFieldReason(flatFieldMetadata)}`,
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
