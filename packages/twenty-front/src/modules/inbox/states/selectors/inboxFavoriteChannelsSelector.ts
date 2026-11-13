import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { aiChatAccessibleChannelsSelector } from '@/ai/states/selectors/aiChatAccessibleChannelsSelector';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type AiChatChannel } from '@/ai/types/AiChatChannel';

export const inboxFavoriteChannelsSelector = createAtomSelector<
  AiChatChannel[]
>({
  key: 'inboxFavoriteChannelsSelector',
  get: ({ get }) => {
    const accessibleChannelById = new Map(
      get(aiChatAccessibleChannelsSelector).map((channel) => [
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
