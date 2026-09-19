import {
  AiChatChannelMenu,
  getAiChatChannelMenuDropdownId,
} from '@/ai/components/AiChatChannelMenu';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { useAiChatChannelIdFromPath } from '@/ai/hooks/useAiChatChannelIdFromPath';
import { useAiChatChannelThreads } from '@/ai/hooks/useAiChatChannelThreads';
import { useAiChatUnreadThreadCount } from '@/ai/hooks/useAiChatUnreadThreadCount';
import { useNavigateToAiChatChannelPage } from '@/ai/hooks/useNavigateToAiChatChannelPage';
import { getAiChatChannelIcon } from '@/ai/utils/getAiChatChannelIcon';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type NavigationDrawerAiChatChannelItemProps = {
  channel: FlatAgentChatChannel;
};

export const NavigationDrawerAiChatChannelItem = ({
  channel,
}: NavigationDrawerAiChatChannelItemProps) => {
  const currentChannelId = useAiChatChannelIdFromPath();
  const { channelThreads } = useAiChatChannelThreads(channel.id);
  const unreadThreadCount = useAiChatUnreadThreadCount(channelThreads);
  const { navigateToAiChatChannelPage } = useNavigateToAiChatChannelPage();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getAiChatChannelMenuDropdownId({
      channelId: channel.id,
      surface: AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER,
    }),
  );

  const isActive = currentChannelId === channel.id;

  return (
    <NavigationDrawerItem
      Icon={getAiChatChannelIcon(channel.visibility)}
      label={channel.name}
      active={isActive}
      secondaryLabel={
        unreadThreadCount > 0 ? String(unreadThreadCount) : undefined
      }
      onClick={() => navigateToAiChatChannelPage(channel.id)}
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={
        <AiChatChannelMenu
          channel={channel}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.NAV_DRAWER}
        />
      }
    />
  );
};
