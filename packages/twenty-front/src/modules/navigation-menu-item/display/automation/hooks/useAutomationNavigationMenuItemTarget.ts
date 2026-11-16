import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { GetCoreWorkflowDocument } from '~/generated/graphql';
import {
  FindOneAgentDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const useAutomationNavigationMenuItemTarget = (
  item: NavigationMenuItem,
) => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const hasWorkflowsPermission = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const workflowId =
    item.type === NavigationMenuItemType.WORKFLOW ? item.workflowId : null;
  const agentId =
    item.type === NavigationMenuItemType.AGENT ? item.agentId : null;

  const workflowQuery = useQuery(GetCoreWorkflowDocument, {
    client: apolloCoreClient,
    variables: { coreWorkflowId: workflowId ?? '' },
    skip: !isDefined(workflowId) || !hasWorkflowsPermission,
  });
  const agentQuery = useQuery(FindOneAgentDocument, {
    variables: { id: agentId ?? '' },
    skip: !isDefined(agentId) || !hasAiPermission,
  });

  const workflow = workflowQuery.data?.coreWorkflow;
  const agent = agentQuery.data?.findOneAgent;

  const getIsUnavailable = () => {
    if (item.type === NavigationMenuItemType.WORKFLOW) {
      return (
        !hasWorkflowsPermission ||
        isDefined(workflowQuery.error) ||
        (!workflowQuery.loading && !isDefined(workflow))
      );
    }

    if (item.type === NavigationMenuItemType.AGENT) {
      return (
        !hasAiPermission ||
        isDefined(agentQuery.error) ||
        (!agentQuery.loading && !isDefined(agent))
      );
    }

    return false;
  };

  const getLabel = () => {
    if (isDefined(workflow)) {
      return isNonEmptyString(workflow.name) ? workflow.name : t`Untitled`;
    }

    if (isDefined(agent)) {
      return agent.label;
    }

    return item.name ?? '';
  };

  return {
    label: getLabel(),
    workflow,
    agent,
    isUnavailable: getIsUnavailable(),
  };
};
