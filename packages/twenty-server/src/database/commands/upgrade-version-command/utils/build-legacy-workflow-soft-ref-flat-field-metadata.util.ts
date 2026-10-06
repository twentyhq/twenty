import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildLegacyWorkflowSoftRefFlatFieldMetadata = ({
  workspaceId,
  twentyStandardApplicationId,
  flatObjectMetadata,
  universalIdentifier,
  name,
  label,
  description,
}: {
  workspaceId: string;
  twentyStandardApplicationId: string;
  flatObjectMetadata: FlatObjectMetadata;
  universalIdentifier: string;
  name: string;
  label: string;
  description: string;
}): FlatFieldMetadata => {
  const now = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: flatObjectMetadata.id,
    type: FieldMetadataType.UUID,
    name,
    label,
    description,
    icon: 'IconSettingsAutomation',
    isActive: true,
    isSystem: true,
    isSystemSideEffect: false,
    isNullable: true,
    isUnique: false,
    isSearchable: false,
    isAuditLogged: true,
    isUIEditable: false,
    writability: MetadataWritability.OPEN,
    isLabelSyncedWithName: false,
    overrides: null,
    defaultValue: null,
    settings: null,
    options: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    fieldPermissionIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    calendarEndViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: now,
    updatedAt: now,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataIds: [],
    searchFieldMetadataUniversalIdentifiers: [],
    universalSettings: null,
  };
};
