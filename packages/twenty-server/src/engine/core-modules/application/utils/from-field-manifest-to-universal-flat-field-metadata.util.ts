import {
  type FieldManifest,
  type RelationFieldManifest,
} from 'twenty-shared/application';
import { type FieldMetadataType } from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const isRelationFieldManifest = (
  fieldManifest: FieldManifest<FieldMetadataType>,
): fieldManifest is RelationFieldManifest =>
  isMorphOrRelationFieldMetadataType(fieldManifest.type);

const getRelationTargetUniversalIdentifiers = (
  fieldManifest: FieldManifest<FieldMetadataType>,
): {
  relationTargetFieldMetadataUniversalIdentifier: string | null;
  relationTargetObjectMetadataUniversalIdentifier: string | null;
} => {
  if (!isRelationFieldManifest(fieldManifest)) {
    return {
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
    };
  }

  if (
    !fieldManifest.relationTargetFieldMetadataUniversalIdentifier ||
    !fieldManifest.relationTargetObjectMetadataUniversalIdentifier
  ) {
    throw new ApplicationException(
      `Field "${fieldManifest.name}" is of type ${fieldManifest.type} but is missing relationTargetFieldMetadataUniversalIdentifier or relationTargetObjectMetadataUniversalIdentifier`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    relationTargetFieldMetadataUniversalIdentifier:
      fieldManifest.relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier:
      fieldManifest.relationTargetObjectMetadataUniversalIdentifier,
  };
};

export const fromFieldManifestToUniversalFlatFieldMetadata = ({
  fieldManifest,
  applicationUniversalIdentifier,
  now,
}: {
  fieldManifest: FieldManifest<FieldMetadataType> & {
    objectUniversalIdentifier: string;
  };
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFieldMetadata => {
  const {
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
  } = getRelationTargetUniversalIdentifiers(fieldManifest);

  return {
    universalIdentifier: fieldManifest.universalIdentifier,
    applicationUniversalIdentifier,
    type: fieldManifest.type,
    name: fieldManifest.name,
    label: fieldManifest.label,
    description: fieldManifest.description ?? null,
    icon: fieldManifest.icon ?? null,
    standardOverrides: null,
    options: fieldManifest.options ?? null,
    defaultValue:
      fieldManifest.defaultValue ?? generateDefaultValue(fieldManifest.type),
    universalSettings: fieldManifest.universalSettings ?? null,
    isCustom: true,
    isActive: true,
    isSystem: false,
    isUIReadOnly: false,
    isNullable: fieldManifest.isNullable ?? true,
    isUnique: false,
    isLabelSyncedWithName: false,
    morphId: null,
    objectMetadataUniversalIdentifier: fieldManifest.objectUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
