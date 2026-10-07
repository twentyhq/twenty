import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSearch } from 'twenty-ui/icon';

import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { type AgentChatChannelListItem } from '~/generated-metadata/graphql';

const AI_CHAT_BROWSE_CHANNELS_DROPDOWN_ID = 'ai-chat-browse-channels';

type NavigationDrawerAiChatBrowseChannelsDropdownProps = {
  channels: AgentChatChannelListItem[];
};

export const NavigationDrawerAiChatBrowseChannelsDropdown = ({
  channels,
}: NavigationDrawerAiChatBrowseChannelsDropdownProps) => {
  const { t } = useLingui();
  const { joinAgentChatChannel } = useAgentChatChannelActions();
  const { openAgentChatChannel } = useOpenAgentChatChannel();

  const handleJoin = async (channelId: string) => {
    if (isDefined(await joinAgentChatChannel(channelId))) {
      openAgentChatChannel(channelId);
    }
  };

  return (
    <DropdownRoot
      type="picker"
      dropdownId={AI_CHAT_BROWSE_CHANNELS_DROPDOWN_ID}
    >
      <Dropdown.Trigger
        render={
          <LightIconButton emphasis="subtle" aria-label={t`Browse channels`}>
            <IconSearch />
          </LightIconButton>
        }
      />
      <DropdownContent side="right" align="start">
        <Dropdown.Section label={t`Join a channel`} scrollable>
          {channels.length === 0 ? (
            <Dropdown.Empty>{t`No other channels`}</Dropdown.Empty>
          ) : (
            channels.map((channel) => {
              const memberCount = channel.memberCount;

              return (
                <Dropdown.ActionItem
                  key={channel.id}
                  description={t`${memberCount} members`}
                  onClick={() => void handleJoin(channel.id)}
                >
                  {channel.name}
                </Dropdown.ActionItem>
              );
            })
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
