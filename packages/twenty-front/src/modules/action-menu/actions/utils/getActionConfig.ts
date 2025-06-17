import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { WORKFLOW_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowActionsConfig';
import { WORKFLOW_RUNS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowRunsActionsConfig';
import { WORKFLOW_VERSIONS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowVersionsActionsConfig';
import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getActionConfig = ({
  objectMetadataItem,
  notePermissions,
  taskPermissions,
  companyPermissions,
  personPermissions,
  opportunityPermissions,
  workflowPermissions,
}: {
  objectMetadataItem?: ObjectMetadataItem;
  notePermissions: { canRead: boolean };
  taskPermissions: { canRead: boolean };
  companyPermissions: { canRead: boolean };
  personPermissions: { canRead: boolean };
  opportunityPermissions: { canRead: boolean };
  workflowPermissions: { canRead: boolean };
}) => {
  if (!isDefined(objectMetadataItem)) {
    return {};
  }

  let actionsConfig: Record<string, ActionConfig>;

  switch (objectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Workflow: {
      actionsConfig = WORKFLOW_ACTIONS_CONFIG;
      break;
    }
    case CoreObjectNameSingular.WorkflowVersion: {
      actionsConfig = WORKFLOW_VERSIONS_ACTIONS_CONFIG;
      break;
    }
    case CoreObjectNameSingular.WorkflowRun: {
      actionsConfig = WORKFLOW_RUNS_ACTIONS_CONFIG;
      break;
    }
    default:
      actionsConfig = DEFAULT_RECORD_ACTIONS_CONFIG;
  }

  const filteredActionsConfig = { ...actionsConfig };

  if (!notePermissions.canRead) {
    delete filteredActionsConfig[NoSelectionRecordActionKeys.GO_TO_NOTES];
  }

  if (!taskPermissions.canRead) {
    delete filteredActionsConfig[NoSelectionRecordActionKeys.GO_TO_TASKS];
  }

  if (!companyPermissions.canRead) {
    delete filteredActionsConfig[NoSelectionRecordActionKeys.GO_TO_COMPANIES];
  }

  if (!personPermissions.canRead) {
    delete filteredActionsConfig[NoSelectionRecordActionKeys.GO_TO_PEOPLE];
  }

  if (!opportunityPermissions.canRead) {
    delete filteredActionsConfig[
      NoSelectionRecordActionKeys.GO_TO_OPPORTUNITIES
    ];
  }

  if (!workflowPermissions.canRead) {
    delete filteredActionsConfig[NoSelectionRecordActionKeys.GO_TO_WORKFLOWS];
  }

  actionsConfig = filteredActionsConfig;

  return actionsConfig;
};
