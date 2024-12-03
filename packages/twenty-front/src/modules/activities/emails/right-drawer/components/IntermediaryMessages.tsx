import styled from '@emotion/styled';
import { useState } from 'react';
import { Button, IconArrowsVertical } from 'twenty-ui';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

const StyledButtonContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 16px 24px;
`;

export const IntermediaryMessages = ({
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
