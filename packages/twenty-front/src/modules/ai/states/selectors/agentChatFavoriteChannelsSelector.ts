import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

export const agentChatFavoriteChannelsSelector = createAtomSelector<
  AgentChatChannel[]
>({
  key: 'agentChatFavoriteChannelsSelector',
  get: ({ get }) => {
    const accessibleChannelById = new Map(
      get(agentChatAccessibleChannelsSelector).map((channel) => [
        channel.id,
        channel,
      ]),
    );

    return get(navigationMenuItemsSelector)
      .filter(
        (item) =>
          isDefined(item.userWorkspaceId) &&
          item.type === NavigationMenuItemType.AGENT_CHAT_CHANNEL,
      )
      .sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        const channel = isDefined(item.agentChatChannelId)
          ? accessibleChannelById.get(item.agentChatChannelId)
          : undefined;

        return isDefined(channel) ? [channel] : [];
      });
  },
});
