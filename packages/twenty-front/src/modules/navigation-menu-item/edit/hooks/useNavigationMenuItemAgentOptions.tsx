import { useQuery } from '@apollo/client/react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NewNavigationMenuItemInput } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { type NavigationMenuItemOption } from '@/navigation-menu-item/edit/types/NavigationMenuItemOption';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import {
  FindManyAgentsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

type UseNavigationMenuItemAgentOptionsParams = {
  skip: boolean;
  currentItems: NavigationMenuItem[];
  addItem: (input: NewNavigationMenuItemInput) => void;
};

export const useNavigationMenuItemAgentOptions = ({
  skip,
  currentItems,
  addItem,
}: UseNavigationMenuItemAgentOptionsParams) => {
  const { data: agentsData, loading: agentOptionsLoading } = useQuery(
    FindManyAgentsDocument,
    { skip },
  );

  const agentOptions: NavigationMenuItemOption[] = (
    agentsData?.findManyAgents ?? []
  )
    .filter((agent) => !agent.isSystem)
    .sort((firstAgent, secondAgent) =>
      firstAgent.label.localeCompare(secondAgent.label),
    )
    .map((agent) => {
      const isAlreadyInSidebar = currentItems.some(
        (item) => item.agentId === agent.id,
      );

      return {
        id: agent.id,
        label: agent.label,
        icon: (
          <CoreAgentIcon
            agentId={agent.id}
            avatarColor={agent.avatarColor}
            avatarShape={agent.avatarShape}
            size={16}
          />
        ),
        isAlreadyInSidebar,
        isDisabled: isAlreadyInSidebar,
        onClick: () =>
          addItem({
            type: NavigationMenuItemType.AGENT,
            agentId: agent.id,
            name: agent.label,
          }),
      };
    });

  return { agentOptions, agentOptionsLoading };
};
