import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDrawerAiChatBrowseChannelsDropdown } from '@/ai/components/NavigationDrawerAiChatBrowseChannelsDropdown';
import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { AGENT_CHAT_CHANNEL_DEFAULT_ICON } from '@/ai/constants/AgentChatChannelDefaultIcon';
import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID = 'AiChatChannels';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const NavigationDrawerAiChatChannelsSection = () => {
  const { t } = useLingui();
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const { openNavigationSection } = useNavigationSection(
    AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID,
  );
  const { createAgentChatChannel } = useAgentChatChannelActions();
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const DefaultChannelIcon = useAgentChatChannelIcon(
    AGENT_CHAT_CHANNEL_DEFAULT_ICON,
  );
  const [newChannelName, setNewChannelName] = useState<string | null>(null);

  if (!isDefined(agentChatChannels)) {
    return null;
  }

  const joinedChannels = agentChatChannels.filter(({ isMember }) => isMember);
  const otherChannels = agentChatChannels.filter(({ isMember }) => !isMember);

  const startCreate = () => {
    openNavigationSection();
    setNewChannelName('');
  };

  const commitCreate = async (name: string) => {
    setNewChannelName(null);

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return;
    }

    const channelId = await createAgentChatChannel(trimmedName);

    if (isDefined(channelId)) {
      openAgentChatChannel(channelId);
    }
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID}
      label={t`Channels`}
      alwaysShowRightIcon={joinedChannels.length === 0}
      rightIcon={
        <StyledRightIconsContainer>
          <NavigationDrawerAiChatBrowseChannelsDropdown
            channels={otherChannels}
          />
          <LightIconButton
            emphasis="subtle"
            aria-label={t`New channel`}
            onClick={startCreate}
          >
            <IconPlus />
          </LightIconButton>
        </StyledRightIconsContainer>
      }
    >
      {joinedChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={agentChatChannelSummaries[channel.id]}
          destinationChannels={joinedChannels.filter(
            ({ id }) => id !== channel.id,
          )}
        />
      ))}
      {isDefined(newChannelName) ? (
        <NavigationDrawerInput
          Icon={DefaultChannelIcon}
          value={newChannelName}
          onChange={setNewChannelName}
          onSubmit={(name) => void commitCreate(name)}
          onCancel={() => setNewChannelName(null)}
          onClickOutside={(_event, name) => void commitCreate(name)}
          placeholder={t`Channel name`}
        />
      ) : (
        joinedChannels.length === 0 && (
          <NavigationDrawerItem
            label={t`New channel`}
            Icon={IconPlus}
            variant="tertiary"
            onClick={startCreate}
            triggerEvent="CLICK"
          />
        )
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
