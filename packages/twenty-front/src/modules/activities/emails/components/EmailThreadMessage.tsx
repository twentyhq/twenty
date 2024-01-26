import { useState } from 'react';
import styled from '@emotion/styled';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageReceivers } from '@/activities/emails/components/EmailThreadMessageReceivers';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

const StyledThreadMessage = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4, 6)};
`;

const StyledThreadMessageHeader = styled.div`
  display: flex;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type EmailThreadMessageProps = {
  body: string;
  sentAt: string;
  participants: EmailThreadMessageParticipant[];
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  participants,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const from = participants.find((participant) => participant.role === 'from');
  const receivers = participants.filter(
    (participant) => participant.role !== 'from',
  );

  if (!from || receivers.length === 0) {
    return null;
  }

  return (
    <StyledThreadMessage>
      <StyledThreadMessageHeader onClick={() => setIsOpen(!isOpen)}>
        <EmailThreadMessageSender sender={from} sentAt={sentAt} />
        {isOpen && <EmailThreadMessageReceivers receivers={receivers} />}
      </StyledThreadMessageHeader>
      {isOpen ? (
        <EmailThreadMessageBody body={body} />
      ) : (
        <EmailThreadMessageBodyPreview body={body} />
      )}
    </StyledThreadMessage>
  );
};
