import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { WORKFLOW_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowActionsConfig';
import { WORKFLOW_RUNS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowRunsActionsConfig';
import { WORKFLOW_VERSIONS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowVersionsActionsConfig';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getActionConfig = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
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

  actionsConfig = filteredActionsConfig;

  return actionsConfig;
};
