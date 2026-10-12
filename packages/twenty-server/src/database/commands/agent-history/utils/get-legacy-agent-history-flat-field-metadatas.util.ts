import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// The standard objects dropped these columns in 2.47, but the 2.42 history move
// copies into them and the 2.43 to 2.46 commands read them, so a workspace
// upgrading through those versions gets them until 2.47 drops them again
const LEGACY_AGENT_HISTORY_FIELDS = [
  {
    objectName: 'agentChatThread',
    universalIdentifier: 'bf830886-b6dc-46e9-a229-eecbb0e66032',
    name: 'userWorkspaceId',
    type: FieldMetadataType.UUID,
    label: 'User Workspace ID',
    icon: 'IconId',
    isNullable: true,
    defaultValue: null,
  },
  {
    objectName: 'agentChatThread',
    universalIdentifier: '2e389238-ba5c-4951-83d4-b14f94592c5c',
    name: 'lastStreamError',
    type: FieldMetadataType.RAW_JSON,
    label: 'Last Stream Error',
    icon: 'IconCode',
    isNullable: true,
    defaultValue: null,
  },
  {
    objectName: 'agentMessage',
    universalIdentifier: 'f4184c3a-b85c-4cef-8181-b2fefdf98fda',
    name: 'senderUserWorkspaceId',
    type: FieldMetadataType.UUID,
    label: 'Sender workspace membership ID',
    icon: 'IconUser',
    isNullable: true,
    defaultValue: null,
  },
  {
    objectName: 'agentMessage',
    universalIdentifier: 'be06f3d5-edb4-4243-89ad-71810b79b319',
    name: 'isHidden',
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Hidden',
    icon: 'IconToggleLeft',
    isNullable: false,
    defaultValue: false,
  },
] as const;

export const getLegacyAgentHistoryFlatFieldMetadatas = ({
  standard,
}: {
  standard: Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;
}): FlatFieldMetadata[] =>
  LEGACY_AGENT_HISTORY_FIELDS.map((field) => {
    const object = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: standard.flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS[field.objectName].universalIdentifier,
    });

    return {
      id: v4(),
      universalIdentifier: field.universalIdentifier,
      applicationId: object.applicationId,
      workspaceId: object.workspaceId,
      objectMetadataId: object.id,
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.label,
      icon: field.icon,
      isActive: true,
      isSystem: true,
      isSystemSideEffect: false,
      isNullable: field.isNullable,
      isUnique: false,
      isSearchable: false,
      isAuditLogged: false,
      isUIEditable: false,
      writability: MetadataWritability.SYSTEM,
      isLabelSyncedWithName: false,
      overrides: null,
      defaultValue: field.defaultValue,
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
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: object.universalIdentifier,
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
  });
