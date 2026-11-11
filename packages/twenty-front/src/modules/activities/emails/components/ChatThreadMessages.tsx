import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getOutgoingMessageIds } from '@/activities/emails/utils/getOutgoingMessageIds';
import { groupChatMessagesBySender } from '@/activities/emails/utils/groupChatMessagesBySender';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[4]};
`;

type ChatThreadMessagesProps = {
  messages: EmailThreadMessageWithSender[];
  reactionsByMessageId?: Record<string, ChatMessageReaction[]>;
  onReactionToggle?: (messageId: string, emoji: string) => void;
};

export const ChatThreadMessages = ({
  messages,
  reactionsByMessageId,
  onReactionToggle,
}: ChatThreadMessagesProps) => {
  const { t } = useLingui();
  const { channels, hasLoaded, loading } = useMyMessageChannels();

  if (!hasLoaded && loading) {
    return <EmailLoader loadingText={t`Loading thread`} />;
  }

  const outgoingMessageIds = getOutgoingMessageIds({
    messages,
    viewerMessageChannelIds: new Set(channels.map(({ id }) => id)),
  });

  const groups = groupChatMessagesBySender(messages, outgoingMessageIds);

  return (
    <StyledContainer>
      {groups.map((group) => (
        <ChatThreadMessageGroup
          key={group.id}
          group={group}
          reactionsByMessageId={reactionsByMessageId}
          onReactionToggle={onReactionToggle}
        />
      ))}
    </StyledContainer>
  );
};
