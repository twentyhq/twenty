import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useNavigationMenuItemAgentOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemAgentOptions';
import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuItemWorkflowOptions } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemWorkflowOptions';
import { compareAlreadyInSidebarLast } from '@/navigation-menu-item/edit/utils/compareAlreadyInSidebarLast';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

type UseNavigationMenuItemAutomationOptionsParams = {
  search: string;
  skip: boolean;
  currentItems: NavigationMenuItem[];
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const useNavigationMenuItemAutomationOptions = ({
  search,
  skip,
  currentItems,
  addItem,
}: UseNavigationMenuItemAutomationOptionsParams) => {
  const { t } = useLingui();
  const hasWorkflowsPermission = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const { workflowOptions, workflowOptionsLoading } =
    useNavigationMenuItemWorkflowOptions({
      search,
      skip: skip || !hasWorkflowsPermission,
      currentItems,
      addItem,
    });
  const { agentOptions, agentOptionsLoading } =
    useNavigationMenuItemAgentOptions({
      skip: skip || !hasAiPermission,
      currentItems,
      addItem,
    });

  return {
    hasAutomationAccess: hasWorkflowsPermission || hasAiPermission,
    automationItemGroups: [
      {
        label: t`Workflows`,
        items: workflowOptions.toSorted(compareAlreadyInSidebarLast),
      },
      {
        label: t`Agents`,
        items: agentOptions.toSorted(compareAlreadyInSidebarLast),
      },
    ],
    automationLoading: workflowOptionsLoading || agentOptionsLoading,
  };
};
