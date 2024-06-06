import { useState } from 'react';
import styled from '@emotion/styled';
import { IconArrowsVertical } from 'twenty-ui';

import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
import { Button } from '@/ui/input/button/components/Button';

const StyledButtonContainer = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding: 16px 24px;
`;

export const IntermediaryMessages = ({
  messages,
}: {
  messages: EmailThreadMessageType[];
}) => {
  const [areMessagesOpen, setAreMessagesOpen] = useState(false);

  if (messages.length === 0) {
    return null;
  }

  return areMessagesOpen ? (
    messages.map((message) => (
      <EmailThreadMessage
        key={message.id}
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
