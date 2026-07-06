import { type FieldManifest } from 'twenty-shared/application';
import {
  FieldMetadataType,
  type RelationAndMorphRelationFieldMetadataType,
} from 'twenty-shared/types';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { nullifyEmptyCompositeDefaultValue } from 'src/engine/metadata-modules/flat-field-metadata/utils/nullify-empty-composite-default-value.util';
import { PARTIAL_SYSTEM_FLAT_FIELD_METADATAS } from 'src/engine/metadata-modules/object-metadata/constants/partial-system-flat-field-metadatas.constant';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const isRelationFieldManifest = (
  fieldManifest: FieldManifest,
): fieldManifest is FieldManifest<RelationAndMorphRelationFieldMetadataType> =>
  isMorphOrRelationFieldMetadataType(fieldManifest.type);

const getRelationTargetUniversalIdentifiers = (
  fieldManifest: FieldManifest,
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
  fieldManifest: FieldManifest & {
    objectUniversalIdentifier: string;
  };
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFieldMetadata => {
  const {
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
  } = getRelationTargetUniversalIdentifiers(fieldManifest);

  // The default system fields are synthesized by the objectMetadata side-effect
  // engine handlers. Legacy manifests that still declare them are tolerated and
  // flagged isSystemSideEffect below so they dedup against the synthesized field.
  // The default name field and default relation fields are caller-provided (SDK
  // auto-complete): they are declared in the manifest as normal fields. We still
  // re-normalize composite defaults here for author-declared composite fields
  // whose canonical shape the SDK cannot know.
  const rawDefaultValue =
    fieldManifest.defaultValue ?? generateDefaultValue(fieldManifest.type);
  const defaultValue = isCompositeFieldMetadataType(fieldManifest.type)
    ? nullifyEmptyCompositeDefaultValue({
        defaultValue: rawDefaultValue,
        fieldType: fieldManifest.type as CompositeFieldMetadataType,
      })
    : rawDefaultValue;

  return {
    universalIdentifier: fieldManifest.universalIdentifier,
    applicationUniversalIdentifier,
    type: fieldManifest.type,
    name: fieldManifest.name,
    label: fieldManifest.label,
    description: fieldManifest.description ?? null,
    icon: fieldManifest.icon ?? null,
    overrides: null,
    options: fieldManifest.options ?? null,
    defaultValue,
    universalSettings: fieldManifest.universalSettings ?? null,
    isActive: true,
    isSystem: fieldManifest.name in PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
    // Only the reserved system fields are engine-owned. A legacy manifest that
    // still declares one is tolerated by flagging it isSystemSideEffect so it
    // dedups against the synthesized field and is excluded from deletion
    // inference. The name field and default relations are caller-provided.
    isSystemSideEffect:
      fieldManifest.name in PARTIAL_SYSTEM_FLAT_FIELD_METADATAS,
    isUIEditable: fieldManifest.isUIEditable ?? true,
    isNullable: fieldManifest.isNullable ?? true,
    isUnique: fieldManifest.isUnique ?? false,
    isLabelSyncedWithName: false,
    morphId:
      fieldManifest.type === FieldMetadataType.MORPH_RELATION
        ? (fieldManifest.morphId ?? null)
        : null,
    objectMetadataUniversalIdentifier: fieldManifest.objectUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
