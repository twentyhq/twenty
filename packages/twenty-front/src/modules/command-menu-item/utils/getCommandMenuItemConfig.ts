import { DASHBOARD_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/DashboardCommandMenuItemsConfig';
import { DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/DefaultRecordCommandMenuItemsConfig';
import { WORKFLOW_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/WorkflowCommandMenuItemsConfig';
import { WORKFLOW_RUNS_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/WorkflowRunsCommandMenuItemsConfig';
import { WORKFLOW_VERSIONS_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/WorkflowVersionsCommandMenuItemsConfig';
import { WORKSPACE_MEMBERS_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/WorkspaceMembersCommandMenuItemsConfig';
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
      return DASHBOARD_COMMAND_MENU_ITEMS_CONFIG;
    }
    case CoreObjectNameSingular.Workflow: {
      return WORKFLOW_COMMAND_MENU_ITEMS_CONFIG;
    }
    case CoreObjectNameSingular.WorkflowVersion: {
      return WORKFLOW_VERSIONS_COMMAND_MENU_ITEMS_CONFIG;
    }
    case CoreObjectNameSingular.WorkflowRun: {
      return WORKFLOW_RUNS_COMMAND_MENU_ITEMS_CONFIG;
    }
    case CoreObjectNameSingular.WorkspaceMember: {
      return WORKSPACE_MEMBERS_COMMAND_MENU_ITEMS_CONFIG;
    }
    case CoreObjectNameSingular.Company: {
      return DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG;
    }
    default: {
      return DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG;
    }
  }
};
