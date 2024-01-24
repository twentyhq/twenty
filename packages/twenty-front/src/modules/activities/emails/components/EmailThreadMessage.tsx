import React, { useState } from 'react';
import styled from '@emotion/styled';

import { EmailThreadMessageBody } from '@/activities/emails/components/EmailThreadMessageBody';
import { EmailThreadMessageBodyPreview } from '@/activities/emails/components/EmailThreadMessageBodyPreview';
import { EmailThreadMessageSender } from '@/activities/emails/components/EmailThreadMessageSender';
import { MockedEmailUser } from '@/activities/emails/mocks/mockedEmailThreads';

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
  id: string;
  body: string;
  sentAt: string;
  from: MockedEmailUser;
  to: MockedEmailUser[];
};

export const EmailThreadMessage = ({
  body,
  sentAt,
  from,
}: EmailThreadMessageProps) => {
  const { displayName, avatarUrl } = from;
  const [isOpen, setIsOpen] = useState(false);

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
