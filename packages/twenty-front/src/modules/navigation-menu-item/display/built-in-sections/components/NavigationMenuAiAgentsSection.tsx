import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { AI_AGENTS_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/common/constants/AiAgentsNavigationSectionId';
import { NavigationMenuTabFirstItemOpenEffect } from '@/navigation-menu-item/display/effect-components/NavigationMenuTabFirstItemOpenEffect';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { StyledNavigationMenuSectionHiddenItems } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuSectionHiddenItems';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { getSortedNonSystemAgents } from '@/object-core/agents/utils/getSortedNonSystemAgents';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindManyAgentsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type NavigationMenuAiAgentsSectionProps = {
  visibleItemLimit?: number | null;
  headerAction?: ReactNode;
};

export const NavigationMenuAiAgentsSection = ({
  visibleItemLimit,
  headerAction,
}: NavigationMenuAiAgentsSectionProps) => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { data, refetch } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !hasAiPermission,
  });
  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const agents = getSortedNonSystemAgents(data?.findManyAgents ?? []);
  const {
    visibleItems: visibleAgents,
    hiddenItems: hiddenAgents,
    hasHiddenItems,
  } = getNavigationSectionVisibleItems({
    items: agents,
    visibleItemLimit,
  });

  if (
    !isDefined(headerAction) &&
    (!hasAiPermission || (agents.length === 0 && !canCreateCoreAgent))
  ) {
    return null;
  }

  const renderAgent = (agent: (typeof agents)[number]) => {
    const agentLink = getCoreAgentLink(agent.id);

    return (
      <Fragment key={agent.id}>
        <NavigationMenuTabFirstItemOpenEffect to={agentLink} />
        <NavigationDrawerItem
          label={agent.label}
          to={isLayoutCustomizationModeEnabled ? undefined : agentLink}
          Icon={() => (
            <CoreAgentIcon
              agentId={agent.id}
              avatarColor={agent.avatarColor}
              avatarShape={agent.avatarShape}
              size={16}
            />
          )}
          active={pathname === agentLink}
          triggerEvent="CLICK"
        />
      </Fragment>
    );
  };

  const handleCreateAgent = async () => {
    await createCoreAgent();
    void refetch().catch(logError);
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_AGENTS_NAVIGATION_SECTION_ID}
      label={t`Agents`}
      alwaysShowRightIcon={isDefined(headerAction) || agents.length === 0}
      rightIcon={
        headerAction ??
        (canCreateCoreAgent ? (
          <LightIconButton
            emphasis="subtle"
            aria-label={t`New agent`}
            disabled={isCreatingCoreAgent}
            onClick={() => void handleCreateAgent()}
          >
            <IconPlus />
          </LightIconButton>
        ) : undefined)
      }
    >
      {visibleAgents.map(renderAgent)}
      {hasHiddenItems && (
        <NavigationMenuSectionSeeMore
          sectionId={AI_AGENTS_NAVIGATION_SECTION_ID}
          hiddenItems={
            <StyledNavigationMenuSectionHiddenItems>
              {hiddenAgents.map(renderAgent)}
            </StyledNavigationMenuSectionHiddenItems>
          }
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
