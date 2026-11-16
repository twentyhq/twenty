import { msg } from '@lingui/core/macro';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-22/constants/legacy-workflow-version-universal-identifiers.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';

// TODO(@thomtrp): remove once the oldest supported upgrade version is past 2.41
export const buildLegacyWorkflowVersionCoreWorkflowVersionIdFlatFieldMetadata =
  ({
    workspaceId,
    workflowVersionObjectMetadataId,
    twentyStandardApplicationId,
    now,
  }: {
    workspaceId: string;
    workflowVersionObjectMetadataId: string;
    twentyStandardApplicationId: string;
    now: string;
  }): FlatFieldMetadata => ({
    id: v4(),
    universalIdentifier:
      LEGACY_WORKFLOW_VERSION_CORE_WORKFLOW_VERSION_ID_FIELD_UNIVERSAL_IDENTIFIER,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    objectMetadataId: workflowVersionObjectMetadataId,
    type: FieldMetadataType.UUID,
    name: 'coreWorkflowVersionId',
    label: i18nLabel(
      msg({
        message: `Core workflow version id`,
        context: 'fieldMetadata.label',
      }),
    ),
    description: i18nLabel(
      msg({
        message: `Reference to the core workflowVersion row`,
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
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataUniversalIdentifier:
      STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflowVersion,
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
