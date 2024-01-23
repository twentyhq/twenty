import React from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { MessageThread } from '@/activities/emails/components/MessageThread';
import { ThreadHeader } from '@/activities/emails/components/ThreadHeader';
import { mockedMessagesByThread } from '@/activities/emails/mocks/mockedThreads';
import { viewableThreadState } from '@/activities/emails/state/viewableThreadState';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: flex-start;
  overflow-y: auto;
  position: relative;
`;

export const RightDrawerThread = () => {
  const viewableThread = useRecoilValue(viewableThreadState);

  if (!viewableThread) {
    return null;
  }

  const mockedMessages = mockedMessagesByThread.get(viewableThread.id) ?? [];

  return (
    <StyledContainer>
      <ThreadHeader
        subject={viewableThread.subject}
        lastMessageSentAt={viewableThread.receivedAt}
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
