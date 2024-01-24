import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { mockedMessagesByThread } from '@/activities/emails/mocks/mockedEmailThreads';
import { viewableEmailThreadState } from '@/activities/emails/state/viewableEmailThreadState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

export const RightDrawerEmailThread = () => {
  const viewableEmailThread = useRecoilValue(viewableEmailThreadState);

  if (!viewableEmailThread) {
    return null;
  }

  const mockedMessages =
    mockedMessagesByThread.get(viewableEmailThread.id) ?? [];

  return (
    <StyledContainer>
      <EmailThreadHeader
        subject={viewableEmailThread.subject}
        lastMessageSentAt={viewableEmailThread.receivedAt}
      />
      {mockedMessages.map((message) => (
        <EmailThreadMessage
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
