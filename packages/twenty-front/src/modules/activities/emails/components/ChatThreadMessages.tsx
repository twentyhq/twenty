import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Fragment } from 'react';

import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type ChatMessageReaction } from '@/activities/emails/types/ChatMessageReaction';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getOutgoingMessageIds } from '@/activities/emails/utils/getOutgoingMessageIds';
import { groupChatMessagesBySender } from '@/activities/emails/utils/groupChatMessagesBySender';
import { ChatMessageDaySeparator } from '@/chat/components/ChatMessageDaySeparator';
import { CHAT_MESSAGE_LIST_GAP } from '@/chat/constants/ChatMessageListGap';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${CHAT_MESSAGE_LIST_GAP};
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
  const { timeZone } = useDateTimeFormat();

  if (!hasLoaded && loading) {
    return <EmailLoader loadingText={t`Loading thread`} />;
  }

  const outgoingMessageIds = getOutgoingMessageIds({
    messages,
    viewerMessageChannelIds: new Set(channels.map(({ id }) => id)),
  });

  const groups = groupChatMessagesBySender({
    messages,
    outgoingMessageIds,
    timeZone,
  });

  return (
    <StyledContainer>
      {groups.map((group, index) => {
        const firstReceivedAt = group.messages[0]?.receivedAt;
        const nextGroup = groups[index + 1];

        return (
          <Fragment key={group.id}>
            {group.isFirstOfDay && isDefined(firstReceivedAt) && (
              <ChatMessageDaySeparator date={firstReceivedAt} />
            )}
            <ChatThreadMessageGroup
              group={group}
              isFollowedByRun={isDefined(nextGroup) && !nextGroup.isFirstOfDay}
              reactionsByMessageId={reactionsByMessageId}
              onReactionToggle={onReactionToggle}
            />
          </Fragment>
        );
      })}
    </StyledContainer>
  );
};
