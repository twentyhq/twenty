import { v4 } from 'uuid';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-44/constants/legacy-chat-thread-workflow-step-id-field-universal-identifier.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// The field as 2.44 first shipped it, frozen here since the standard
// definition no longer declares it.
export const buildLegacyChatThreadWorkflowStepIdFlatFieldMetadata = ({
  workspaceId,
  applicationId,
  threadObjectMetadataId,
  now,
}: {
  workspaceId: string;
  applicationId: string;
  threadObjectMetadataId: string;
  now: string;
}): FlatFieldMetadata => ({
  id: v4(),
  universalIdentifier:
    LEGACY_CHAT_THREAD_WORKFLOW_STEP_ID_FIELD_UNIVERSAL_IDENTIFIER,
  applicationId,
  workspaceId,
  objectMetadataId: threadObjectMetadataId,
  type: FieldMetadataType.TEXT,
  name: 'workflowStepId',
  label: 'Workflow Step ID',
  description: 'Agent step of the workflow run that held this conversation',
  icon: 'IconId',
  isActive: true,
  isSystem: true,
  isSystemSideEffect: false,
  isNullable: true,
  isUnique: false,
  isSearchable: false,
  isAuditLogged: false,
  isUIEditable: false,
  writability: MetadataWritability.SYSTEM,
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
  objectMetadataUniversalIdentifier:
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
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
});
