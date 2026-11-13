import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai/components/AiChatChannelIcon';
import { aiChatChannelsState } from '@/ai/states/aiChatChannelsState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledChannelIcon = styled.div`
  display: flex;
  flex-shrink: 0;
`;

type InboxThreadChannelIconProps = {
  thread: AiChatThreadRecord;
};

export const InboxThreadChannelIcon = ({
  thread,
}: InboxThreadChannelIconProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const channel = useAtomStateValue(aiChatChannelsState)?.find(
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
      <AiChatChannelIcon channel={channel} size={theme.icon.size.sm} />
      <VisuallyHidden>{t`In ${channelName}`}</VisuallyHidden>
    </StyledChannelIcon>
  );
};
