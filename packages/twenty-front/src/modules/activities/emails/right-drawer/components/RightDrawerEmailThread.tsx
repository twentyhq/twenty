import React from 'react';
import styled from '@emotion/styled';

import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadFetchMoreLoader } from '@/activities/emails/components/EmailThreadFetchMoreLoader';
import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useRightDrawerEmailThread } from '@/activities/emails/right-drawer/hooks/useRightDrawerEmailThread';

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
  const { thread, messages, fetchMoreMessages, loading } =
    useRightDrawerEmailThread();

  if (!thread) {
    return null;
  }

  return (
    <StyledContainer>
      <EmailThreadHeader
        subject={thread.subject}
        lastMessageSentAt={thread.lastMessageReceivedAt}
      />
      {loading ? (
        <EmailLoader loadingText="Loading thread" />
      ) : (
        <>
          {messages.map((message) => (
            <EmailThreadMessage
              key={message.id}
              participants={message.messageParticipants}
              body={message.text}
              sentAt={message.receivedAt}
            />
          ))}
          <EmailThreadFetchMoreLoader
            loading={loading}
            onLastRowVisible={fetchMoreMessages}
          />
        </>
      )}
    </StyledContainer>
  );
};
