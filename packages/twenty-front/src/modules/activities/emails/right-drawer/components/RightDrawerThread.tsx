import React from 'react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';

import { MessageThread } from '@/activities/emails/components/MessageThread';
import { ThreadHeader } from '@/activities/emails/components/ThreadHeader';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

export type EmailUser = {
  avatarUrl: string;
  displayName: string;
  workspaceMemberId?: string;
  personId?: string;
};

export type Message = {
  id: string;
  from: EmailUser;
  to: EmailUser[];
  subject: string;
  body: string;
  sentAt: string;
};

export const RightDrawerThread = () => {
  const mockedThread = {
    subject: 'Tes with long subject, very long subject, very long subject',
    receivedAt: new Date(),
  };

  const mockedMessages: Message[] = Array.from({ length: 5 }).map((_, i) => ({
    id: `id${i + 1}`,
    from: {
      avatarUrl: '',
      displayName: `User ${i + 1}`,
      workspaceMemberId: `workspaceMemberId${i + 1}`,
      personId: `personId${i + 1}`,
    },
    to: [
      {
        avatarUrl: 'https://favicon.twenty.com/qonto.com',
        displayName: `User ${i + 2}`,
        workspaceMemberId: `workspaceMemberId${i + 1}`,
        personId: `personId${i + 2}`,
      },
    ],
    subject: `Subject ${i + 1}`,
    body: `Body ${i + 1}. I am testing a very long body. I am adding more text.
I also want to test a new line. To see if it works.

I am adding a new paragraph.

Thomas`,
    sentAt: DateTime.fromFormat('2021-03-12', 'yyyy-MM-dd').toISO() ?? '',
  }));

  return (
    <StyledContainer>
      <ThreadHeader
        subject={mockedThread.subject}
        lastMessageSentAt={mockedThread.receivedAt}
      />
      {mockedMessages.map((message) => (
        <MessageThread
          key={message.id}
          id={message.id}
          from={message.from}
          to={message.to}
          body={message.body}
          sentAt={message.sentAt}
        />
      ))}
    </StyledContainer>
  );
};
