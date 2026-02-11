import { FieldMetadataType } from 'twenty-shared/types';
import {
  type FieldManifest,
  type RelationFieldManifest,
} from 'twenty-shared/application';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const isRelationFieldManifest = (
  fieldManifest: FieldManifest<FieldMetadataType>,
): fieldManifest is RelationFieldManifest =>
  fieldManifest.type === FieldMetadataType.RELATION;

export const fromFieldManifestToUniversalFlatFieldMetadata = ({
  fieldManifest,
  objectUniversalIdentifier,
  applicationUniversalIdentifier,
  now,
}: {
  fieldManifest: FieldManifest<FieldMetadataType> & {
    objectUniversalIdentifier: string;
  };
  objectUniversalIdentifier: string;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatFieldMetadata => {
  return {
    universalIdentifier: fieldManifest.universalIdentifier,
    applicationUniversalIdentifier,
    type: fieldManifest.type as FieldMetadataType,
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
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier: isRelationFieldManifest(
      fieldManifest,
    )
      ? fieldManifest.relationTargetFieldMetadataUniversalIdentifier
      : null,
    relationTargetObjectMetadataUniversalIdentifier: isRelationFieldManifest(
      fieldManifest,
    )
      ? fieldManifest.relationTargetObjectMetadataUniversalIdentifier
      : null,
    viewFieldUniversalIdentifiers: [],
    viewFilterUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
  };
};
