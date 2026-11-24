import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';

import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { getSortedNonSystemAgents } from '@/object-core/agents/utils/getSortedNonSystemAgents';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import {
  FindManyAgentsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

const AI_AGENTS_NAVIGATION_SECTION_ID = 'AiAgents';

type NavigationMenuAiAgentsSectionProps = {
  headerAction?: ReactNode;
};

export const NavigationMenuAiAgentsSection = ({
  headerAction,
}: NavigationMenuAiAgentsSectionProps) => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { data, refetch } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
    skip: !hasAiPermission,
  });
  const { createCoreAgent, canCreateCoreAgent, isCreatingCoreAgent } =
    useCreateCoreAgent();

  const agents = getSortedNonSystemAgents(data?.findManyAgents ?? []);

  if (
    !isDefined(headerAction) &&
    (!hasAiPermission || (agents.length === 0 && !canCreateCoreAgent))
  ) {
    return null;
  }

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
      {agents.map((agent) => {
        const agentLink = getCoreAgentLink(agent.id);

        return (
          <NavigationDrawerItem
            key={agent.id}
            label={agent.label}
            to={agentLink}
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
        );
      })}
    </CollapsibleNavigationDrawerSection>
  );
};
