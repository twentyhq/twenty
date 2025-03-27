import { DEFAULT_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultActionsConfig';
import { WORKFLOW_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowActionsConfig';
import { WORKFLOW_RUNS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowRunsActionsConfig';
import { WORKFLOW_VERSIONS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowVersionsActionsConfig';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getActionConfig = (objectMetadataItem: ObjectMetadataItem) => {
  switch (objectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Workflow:
      return WORKFLOW_ACTIONS_CONFIG;
    case CoreObjectNameSingular.WorkflowVersion:
      return WORKFLOW_VERSIONS_ACTIONS_CONFIG;
    case CoreObjectNameSingular.WorkflowRun:
      return WORKFLOW_RUNS_ACTIONS_CONFIG;
    default:
      return DEFAULT_ACTIONS_CONFIG;
  }
};
