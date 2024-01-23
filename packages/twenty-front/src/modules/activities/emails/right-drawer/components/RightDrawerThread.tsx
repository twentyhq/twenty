import React from 'react';
import styled from '@emotion/styled';

import { ThreadHeader } from '@/activities/emails/components/ThreadHeader';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow-y: auto;
  position: relative;
`;

export const RightDrawerThread = () => {
  const mockedThread = {
    subject: 'Tes with long subject, very long subject, very long subject',
    receivedAt: new Date(),
  };
  return (
    <StyledContainer>
      <ThreadHeader
        subject={mockedThread.subject}
        lastMessageSentAt={mockedThread.receivedAt}
      />
    </StyledContainer>
  );
};
