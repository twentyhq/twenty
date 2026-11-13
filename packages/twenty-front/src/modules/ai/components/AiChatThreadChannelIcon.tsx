import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { useTheme } from 'twenty-ui/theme';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatSelectedChannelViewSelector } from '@/ai/states/selectors/agentChatSelectedChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledChannelIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`;

type AiChatThreadChannelIconProps = {
  thread: AgentChatThreadRecord;
};

export const AiChatThreadChannelIcon = ({
  thread,
}: AiChatThreadChannelIconProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const channel = useAtomStateValue(agentChatChannelsState)?.find(
    ({ id }) => id === thread.channelId,
  );
  const agentChatSelectedChannelView = useAtomStateValue(
    agentChatSelectedChannelViewSelector,
  );

  if (
    !isDefined(channel) ||
    agentChatSelectedChannelView?.channelId === channel.id
  ) {
    return null;
  }

  const channelName = channel.name;

  return (
    <StyledChannelIcon title={channelName}>
      <AgentChatChannelIcon channel={channel} size={theme.icon.size.sm} />
      <VisuallyHidden>{t`In ${channelName}`}</VisuallyHidden>
    </StyledChannelIcon>
  );
};
