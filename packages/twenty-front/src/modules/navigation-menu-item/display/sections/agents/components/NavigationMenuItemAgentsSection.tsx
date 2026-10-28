import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useLocation } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus, useIcons } from 'twenty-ui/icon';
import { useIsMobile } from 'twenty-ui/utilities';
import {
  FindManyAgentsDocument,
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useNavigationMenuItemSectionLabel } from '@/navigation-menu-item/common/hooks/useNavigationMenuItemSectionLabel';
import { NavigationMenuItemSectionMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemSectionMenu';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';

type NavigationMenuItemAgentsSectionProps = {
  section: NavigationMenuItem;
};

export const NavigationMenuItemAgentsSection = ({
  section,
}: NavigationMenuItemAgentsSectionProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { getIcon } = useIcons();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();
  const { createCoreAgent, canCreateCoreAgent } = useCreateCoreAgent();
  const { data } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !hasAiPermission,
  });
  const navigationSectionId =
    getNavigationMenuSectionNavigationSectionId(section);
  const agents = (data?.findManyAgents ?? [])
    .filter((agent) => !agent.isSystem)
    .sort((agentA, agentB) => agentA.label.localeCompare(agentB.label));
  const {
    visibleItems: visibleAgents,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId,
    items: agents,
    visibleItemLimit: section.visibleItemLimit,
  });

  if (!hasAiPermission) {
    return null;
  }

  const isEditable = isLayoutCustomizationModeEnabled && !isMobile;

  if (agents.length === 0 && !isEditable) {
    return null;
  }

  const defaultLabel = getDefaultSectionLabel(NavigationMenuItemType.AI_AGENTS);
  const newAgentButton = canCreateCoreAgent ? (
    <LightIconButton
      emphasis="subtle"
      aria-label={t`New agent`}
      onClick={() => void createCoreAgent()}
    >
      <IconPlus />
    </LightIconButton>
  ) : undefined;

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={navigationSectionId}
      label={section.name ?? defaultLabel}
      rightIcon={
        isEditable ? (
          <NavigationMenuItemSectionMenu
            section={section}
            defaultName={defaultLabel}
          />
        ) : (
          newAgentButton
        )
      }
      alwaysShowRightIcon={isEditable}
    >
      {visibleAgents.map((agent) => {
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
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
