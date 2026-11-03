import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getAutomationNavigationMenuItemComputedLink = (
  item: Pick<NavigationMenuItem, 'type' | 'workflowId' | 'agentId'>,
): string => {
  if (item.type === NavigationMenuItemType.WORKFLOW) {
    return isDefined(item.workflowId)
      ? getAppPath(AppPath.WorkflowCoreShowPage, {
          coreWorkflowId: item.workflowId,
        })
      : '';
  }

  if (item.type === NavigationMenuItemType.AGENT) {
    return isDefined(item.agentId)
      ? getAppPath(AppPath.AgentShowPage, { agentId: item.agentId })
      : getAppPath(AppPath.AgentIndexPage);
  }

  return '';
};
