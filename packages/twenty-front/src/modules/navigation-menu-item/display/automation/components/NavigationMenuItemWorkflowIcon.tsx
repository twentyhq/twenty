import { Avatar } from 'twenty-ui/primitives/data-display';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useAutomationNavigationMenuItemTarget } from '@/navigation-menu-item/display/automation/hooks/useAutomationNavigationMenuItemTarget';

type NavigationMenuItemWorkflowIconProps = {
  navigationMenuItem: NavigationMenuItem;
};

export const NavigationMenuItemWorkflowIcon = ({
  navigationMenuItem,
}: NavigationMenuItemWorkflowIconProps) => {
  const { workflow } =
    useAutomationNavigationMenuItemTarget(navigationMenuItem);

  return (
    <Avatar
      size="md"
      shape="circle"
      name={workflow?.name ?? navigationMenuItem.name ?? undefined}
      colorSeed={navigationMenuItem.workflowId ?? undefined}
    />
  );
};
