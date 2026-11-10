import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useAutomationNavigationMenuItemTarget } from '@/navigation-menu-item/display/automation/hooks/useAutomationNavigationMenuItemTarget';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';

type NavigationMenuItemAgentIconProps = {
  navigationMenuItem: NavigationMenuItem;
};

export const NavigationMenuItemAgentIcon = ({
  navigationMenuItem,
}: NavigationMenuItemAgentIconProps) => {
  const { agent } = useAutomationNavigationMenuItemTarget(navigationMenuItem);

  return (
    <CoreAgentIcon
      agentId={navigationMenuItem.agentId ?? undefined}
      avatarColor={agent?.avatarColor}
      avatarShape={agent?.avatarShape}
      size={16}
    />
  );
};
