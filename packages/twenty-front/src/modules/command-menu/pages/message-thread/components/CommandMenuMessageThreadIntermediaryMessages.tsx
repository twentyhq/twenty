import styled from '@emotion/styled';
import { useState } from 'react';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { Button } from 'twenty-ui/input';
import { IconArrowsVertical } from 'twenty-ui/display';

const StyledButtonContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 16px 24px;
`;

export const CommandMenuMessageThreadIntermediaryMessages = ({
  messages,
}: {
  messages: EmailThreadMessageWithSender[];
}) => {
  const [areMessagesOpen, setAreMessagesOpen] = useState(false);

  if (messages.length === 0) {
    return null;
  }

  return areMessagesOpen ? (
    messages.map((message) => (
      <EmailThreadMessage
        key={message.id}
        sender={message.sender}
        participants={message.messageParticipants}
        body={message.text}
        sentAt={message.receivedAt}
      />
    ))
  ) : (
    <StyledButtonContainer>
      <Button
        Icon={IconArrowsVertical}
        title={`${messages.length} email${messages.length > 1 ? 's' : ''}`}
        size="small"
        onClick={() => setAreMessagesOpen(true)}
      />
    </StyledButtonContainer>
  );
};
