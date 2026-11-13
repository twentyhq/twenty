import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_PRESET_FILTER_ICONS } from '@/ai/constants/AgentChatThreadPresetFilterIcons';
import { AGENT_CHAT_THREAD_PRESET_FILTER_LABELS } from '@/ai/constants/AgentChatThreadPresetFilterLabels';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { getAgentChatChannelViewLabel } from '@/ai/utils/getAgentChatChannelViewLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatInboxViewHeading = () => {
  const { t } = useLingui();
  const agentChatSelectedThreadListSource = useAtomStateValue(
    agentChatSelectedThreadListSourceState,
  );
  const agentChatSelectedChannelView =
    agentChatSelectedThreadListSource.type === 'channel'
      ? agentChatSelectedThreadListSource.channelView
      : undefined;
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === agentChatSelectedChannelView?.channelId,
  );
  const ChannelIcon = useAgentChatChannelIcon(channel?.icon);

  if (agentChatSelectedThreadListSource.type === 'presetFilter') {
    return {
      HeadingIcon:
        AGENT_CHAT_THREAD_PRESET_FILTER_ICONS[
          agentChatSelectedThreadListSource.presetFilter
        ],
      headingLabel: t(
        AGENT_CHAT_THREAD_PRESET_FILTER_LABELS[
          agentChatSelectedThreadListSource.presetFilter
        ],
      ),
      channelViewLabel: undefined,
    };
  }

  const channelViewLabel = getAgentChatChannelViewLabel(
    agentChatSelectedThreadListSource.channelView,
  );

  if (!isDefined(channel)) {
    return {
      HeadingIcon: ChannelIcon,
      headingLabel: channelViewLabel,
      channelViewLabel: undefined,
    };
  }

  return {
    HeadingIcon: ChannelIcon,
    headingLabel: channel.name,
    channelViewLabel,
  };
};
