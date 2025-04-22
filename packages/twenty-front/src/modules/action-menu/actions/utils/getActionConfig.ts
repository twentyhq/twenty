import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { WORKFLOW_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowActionsConfig';
import { WORKFLOW_RUNS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowRunsActionsConfig';
import { WORKFLOW_VERSIONS_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/WorkflowVersionsActionsConfig';
import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getActionConfig = (
  objectMetadataItem?: ObjectMetadataItem,
): Record<string, ActionConfig> => {
  if (!isDefined(objectMetadataItem)) {
    return {};
  }

  switch (objectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Workflow:
      return WORKFLOW_ACTIONS_CONFIG;
    case CoreObjectNameSingular.WorkflowVersion:
      return WORKFLOW_VERSIONS_ACTIONS_CONFIG;
    case CoreObjectNameSingular.WorkflowRun:
      return WORKFLOW_RUNS_ACTIONS_CONFIG;
    default:
      return DEFAULT_RECORD_ACTIONS_CONFIG;
  }
};
