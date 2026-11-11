import { msg } from '@lingui/core/macro';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import {
  LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-23/constants/legacy-workflow-universal-identifiers.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

export const buildLegacyWorkflowCoreWorkflowIdFlatFieldMetadata = ({
  workspaceId,
  workflowObjectMetadataId,
  twentyStandardApplicationId,
  now,
}: {
  workspaceId: string;
  workflowObjectMetadataId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatFieldMetadata => ({
  id: v4(),
  universalIdentifier: LEGACY_WORKFLOW_CORE_WORKFLOW_ID_FIELD_UNIVERSAL_IDENTIFIER,
  applicationId: twentyStandardApplicationId,
  workspaceId,
  objectMetadataId: workflowObjectMetadataId,
  type: FieldMetadataType.UUID,
  name: 'coreWorkflowId',
  label: i18nLabel(
    msg({ message: `Core workflow id`, context: 'fieldMetadata.label' }),
  ),
  description: i18nLabel(
    msg({
      message: `Reference to the core workflow row`,
      context: 'fieldMetadata.description',
    }),
  ),
  icon: 'IconSettingsAutomation',
  isActive: true,
  isSystem: true,
  isSystemSideEffect: false,
  isNullable: true,
  isUnique: false,
  isSearchable: false,
  isAuditLogged: true,
  isUIEditable: false,
  disabledFieldPermissionActions: null,
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
  fieldMetadataOptionIds: [],
  rowLevelPermissionPredicateIds: [],
  relationRowLevelPermissionPredicateIds: [],
  workspaceMemberRowLevelPermissionPredicateIds: [],
  fieldMetadataOptionUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  relationRowLevelPermissionPredicateUniversalIdentifiers: [],
  workspaceMemberRowLevelPermissionPredicateUniversalIdentifiers: [],
  kanbanAggregateOperationViewIds: [],
  calendarViewIds: [],
  calendarEndViewIds: [],
  mainGroupByFieldMetadataViewIds: [],
  createdAt: now,
  updatedAt: now,
  applicationUniversalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: LEGACY_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
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
