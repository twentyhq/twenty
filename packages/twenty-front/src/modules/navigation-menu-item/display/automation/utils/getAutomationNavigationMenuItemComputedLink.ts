import { AppPath, NavigationMenuItemType } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';

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
    return isDefined(item.agentId) ? getCoreAgentLink(item.agentId) : '';
  }

  return '';
};
