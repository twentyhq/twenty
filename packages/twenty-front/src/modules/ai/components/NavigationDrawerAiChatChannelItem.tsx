import {
  AiChatChannelMenu,
  getAiChatChannelMenuDropdownId,
} from '@/ai/components/AiChatChannelMenu';
import { useAiChatChannelIdFromPath } from '@/ai/hooks/useAiChatChannelIdFromPath';
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
  const { navigateToAiChatChannelPage } = useNavigateToAiChatChannelPage();
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    getAiChatChannelMenuDropdownId(channel.id),
  );

  const isActive = currentChannelId === channel.id;

  return (
    <NavigationDrawerItem
      Icon={getAiChatChannelIcon(channel.visibility)}
      label={channel.name}
      active={isActive}
      onClick={() => navigateToAiChatChannelPage(channel.id)}
      isRightOptionsDropdownOpen={isDropdownOpen}
      rightOptions={<AiChatChannelMenu channel={channel} />}
    />
  );
};
