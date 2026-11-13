import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { useTheme } from 'twenty-ui/theme';

import { InboxChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { inboxChannelsState } from '@/ai/states/agentChatChannelsState';
import { inboxSelectedChannelViewSelector } from '@/ai/states/selectors/agentChatSelectedChannelViewSelector';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledChannelIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`;

type InboxThreadChannelIconProps = {
  thread: InboxThreadRecord;
};

export const InboxThreadChannelIcon = ({
  thread,
}: InboxThreadChannelIconProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const channel = useAtomStateValue(inboxChannelsState)?.find(
    ({ id }) => id === thread.channelId,
  );
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );

  if (
    !isDefined(channel) ||
    inboxSelectedChannelView?.channelId === channel.id
  ) {
    return null;
  }

  const channelName = channel.name;

  return (
    <StyledChannelIcon title={channelName}>
      <InboxChannelIcon channel={channel} size={theme.icon.size.sm} />
      <VisuallyHidden>{t`In ${channelName}`}</VisuallyHidden>
    </StyledChannelIcon>
  );
};
