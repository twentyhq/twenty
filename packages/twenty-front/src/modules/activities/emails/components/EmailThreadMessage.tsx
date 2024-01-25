import { useState } from 'react';
import styled from '@emotion/styled';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

const StyledThreadMessage = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4, 6)};
`;

const StyledThreadMessageHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type EmailThreadMessageProps = {
  body: string;
  sentAt: string;
  participants: EmailThreadMessageParticipant[];
};

const getDisplayNameFromParticipant = (
  participant: EmailThreadMessageParticipant,
) => {
  if (participant.person) {
    return `${participant.person?.name?.firstName} ${participant.person?.name?.lastName}`;
  }

  if (participant.workspaceMember) {
    return `${participant.workspaceMember?.name?.firstName} ${participant.workspaceMember?.name?.lastName}`;
  }

  if (participant.displayName) {
    return participant.displayName;
  }

  if (participant.handle) {
    return participant.handle;
  }

  return 'Unknown';
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  participants,
}: EmailThreadMessageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const from = participants.find((participant) => participant.role === 'from');
  const to = participants.filter((participant) => participant.role === 'to');

  if (!from || to.length === 0) {
    return null;
  }

  const displayName = getDisplayNameFromParticipant(from);

  const avatarUrl =
    from.person?.avatarUrl ?? from.workspaceMember?.avatarUrl ?? '';

  return (
    <StyledThreadMessage onClick={() => setIsOpen(!isOpen)}>
      <StyledThreadMessageHeader>
        <EmailThreadMessageSender
          displayName={displayName}
          avatarUrl={avatarUrl}
          sentAt={sentAt}
        />
      </StyledThreadMessageHeader>
      {isOpen ? (
        <EmailThreadMessageBody body={body} />
      ) : (
        <EmailThreadMessageBodyPreview body={body} />
      )}
    </StyledThreadMessage>
  );
};
