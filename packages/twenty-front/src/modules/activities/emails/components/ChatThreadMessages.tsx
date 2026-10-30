import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { useOutgoingMessageIds } from '@/activities/emails/hooks/useOutgoingMessageIds';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { groupChatMessagesBySender } from '@/activities/emails/utils/groupChatMessagesBySender';
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
};

export const ChatThreadMessages = ({ messages }: ChatThreadMessagesProps) => {
  const messageIds = useMemo(() => messages.map(({ id }) => id), [messages]);
  const outgoingMessageIds = useOutgoingMessageIds(messageIds);

  const groups = groupChatMessagesBySender(messages, outgoingMessageIds);

  return (
    <StyledContainer>
      {groups.map((group) => (
        <ChatThreadMessageGroup key={group.id} group={group} />
      ))}
    </StyledContainer>
  );
};
