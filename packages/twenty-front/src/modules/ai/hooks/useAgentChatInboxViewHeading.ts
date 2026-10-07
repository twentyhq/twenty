import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAgentChatInboxViewHeading = () => {
  const { t } = useLingui();
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === agentChatShownChannelView?.channelId,
  );
  const ChannelIcon = useAgentChatChannelIcon(channel?.icon);

  if (isDefined(agentChatShownChannelView)) {
    return { HeadingIcon: ChannelIcon, headingLabel: channel?.name ?? '' };
  }

  return {
    HeadingIcon:
      AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus],
    headingLabel: t(
      AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
    ),
  };
};
