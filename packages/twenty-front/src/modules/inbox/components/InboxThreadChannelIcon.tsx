import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { VisuallyHidden } from 'twenty-ui/primitives/accessibility';
import { useTheme } from 'twenty-ui/theme';

import { AiChatChannelIcon } from '@/ai-chat/threads/components/AiChatChannelIcon';
import { aiChatChannelFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatChannelFamilySelector';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
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
  const aiChatChannel = useAtomFamilySelectorValue(
    aiChatChannelFamilySelector,
    thread.channelId,
  );
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );

  if (
    !isDefined(aiChatChannel) ||
    inboxSelectedChannelView?.channelId === aiChatChannel.id
  ) {
    return null;
  }

  const channelName = aiChatChannel.name;

  return (
    <StyledChannelIcon title={channelName}>
      <AiChatChannelIcon channel={aiChatChannel} size={theme.icon.size.sm} />
      <VisuallyHidden>{t`In ${channelName}`}</VisuallyHidden>
    </StyledChannelIcon>
  );
};
