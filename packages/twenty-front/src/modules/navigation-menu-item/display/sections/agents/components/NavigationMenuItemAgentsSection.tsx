import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation } from 'react-router-dom';
import { useIcons } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  FindManyAgentsDocument,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemAiChatSectionLabel } from '@/navigation-menu-item/display/sections/ai-chat/hooks/useNavigationMenuItemAiChatSectionLabel';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemAgentsSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemAgentsSection = ({
  section,
}: NavigationMenuItemAgentsSectionProps) => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { getIcon } = useIcons();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { getDefaultAiChatSectionLabel } =
    useNavigationMenuItemAiChatSectionLabel();
  const { data } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !hasAiPermission,
  });

  if (!hasAiPermission) {
    return null;
  }

  const agents = (data?.findManyAgents ?? [])
    .filter((agent) => !agent.isSystem)
    .sort((agentA, agentB) => agentA.label.localeCompare(agentB.label));
  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;

  if (agents.length === 0 && !isEditable) {
    return null;
  }

  const defaultLabel = getDefaultAiChatSectionLabel(section.type);

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={`navigation-menu-section-${section.id}`}
      label={section.name ?? defaultLabel}
      rightIcon={
        isEditable ? (
          <NavigationMenuItemSectionMenu
            section={section}
            defaultName={defaultLabel}
          />
        ) : undefined
      }
      alwaysShowRightIcon={isEditable}
    >
      {agents.map((agent) => {
        const agentLink = getCoreAgentLink(agent.id);

        return (
          <NavigationDrawerItem
            key={agent.id}
            label={agent.label}
            Icon={getIcon(
              isNonEmptyString(agent.icon) ? agent.icon : 'IconLego',
            )}
            to={isLayoutCustomizationModeEnabled ? undefined : agentLink}
            active={pathname === agentLink}
            triggerEvent="CLICK"
          />
        );
      })}
    </CollapsibleNavigationDrawerSection>
  );
};
