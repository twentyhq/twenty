import { DASHBOARD_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/DashboardActionsConfig';
import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/DefaultRecordActionsConfig';
import { WORKFLOW_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/WorkflowActionsConfig';
import { WORKFLOW_RUNS_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/WorkflowRunsActionsConfig';
import { WORKFLOW_VERSIONS_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/WorkflowVersionsActionsConfig';
import { WORKSPACE_MEMBERS_ACTIONS_CONFIG } from '@/command-menu-item/record/constants/WorkspaceMembersActionsConfig';
import { type CommandMenuItemConfig } from '@/command-menu-item/types/CommandMenuItemConfig';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getCommandMenuItemConfig = ({
  objectMetadataItem,
}: {
  objectMetadataItem?: ObjectMetadataItem;
}): Record<string, CommandMenuItemConfig> => {
  if (!isDefined(objectMetadataItem)) {
    return {};
  }

  switch (objectMetadataItem.nameSingular) {
    case CoreObjectNameSingular.Dashboard: {
      return DASHBOARD_ACTIONS_CONFIG;
    }
    case CoreObjectNameSingular.Workflow: {
      return WORKFLOW_ACTIONS_CONFIG;
    }
    case CoreObjectNameSingular.WorkflowVersion: {
      return WORKFLOW_VERSIONS_ACTIONS_CONFIG;
    }
    case CoreObjectNameSingular.WorkflowRun: {
      return WORKFLOW_RUNS_ACTIONS_CONFIG;
    }
    case CoreObjectNameSingular.WorkspaceMember: {
      return WORKSPACE_MEMBERS_ACTIONS_CONFIG;
    }
    case CoreObjectNameSingular.Company: {
      return DEFAULT_RECORD_ACTIONS_CONFIG;
    }
    default: {
      return DEFAULT_RECORD_ACTIONS_CONFIG;
    }
  }
};
