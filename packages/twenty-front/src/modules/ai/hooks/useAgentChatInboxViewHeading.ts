import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_THREAD_FILTER_STATUS_ICONS } from '@/ai/constants/AgentChatThreadFilterStatusIcons';
import { AGENT_CHAT_THREAD_FILTER_STATUS_LABELS } from '@/ai/constants/AgentChatThreadFilterStatusLabels';
import { useAgentChatChannelIcon } from '@/ai/hooks/useAgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

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
    const channelStatusLabels = {
      [AgentChatChannelThreadStatus.OPEN]: t`Open`,
      [AgentChatChannelThreadStatus.SNOOZED]: t`Snoozed`,
      [AgentChatChannelThreadStatus.DONE]: t`Done`,
    };
    const channelStatusLabel =
      channelStatusLabels[agentChatShownChannelView.channelStatus];
    const { assignment, channelStatus } = agentChatShownChannelView;
    const isAssignedOpenView =
      channelStatus === AgentChatChannelThreadStatus.OPEN &&
      assignment === AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME;
    const assignmentLabel =
      assignment === AgentChatChannelAssignmentFilter.UNASSIGNED
        ? t`Unassigned`
        : t`Mine`;
    const channelViewLabel = isAssignedOpenView
      ? t`Assigned`
      : assignment === AgentChatChannelAssignmentFilter.ANY
        ? channelStatusLabel
        : t`${channelStatusLabel} · ${assignmentLabel}`;

    return {
      HeadingIcon: ChannelIcon,
      headingLabel: channel?.name ?? '',
      channelViewLabel,
    };
  }

  return {
    HeadingIcon:
      AGENT_CHAT_THREAD_FILTER_STATUS_ICONS[agentChatThreadFilterStatus],
    headingLabel: t(
      AGENT_CHAT_THREAD_FILTER_STATUS_LABELS[agentChatThreadFilterStatus],
    ),
    channelViewLabel: undefined,
  };
};
