import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { EmailThreadFetchMoreLoader } from '@/activities/emails/components/EmailThreadFetchMoreLoader';
import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { viewableEmailThreadState } from '@/activities/emails/state/viewableEmailThreadState';
import { EmailThreadMessage as EmailThreadMessageType } from '@/activities/emails/types/EmailThreadMessage';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

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

  const {
    records: messages,
    loading,
    fetchMoreRecords,
  } = useFindManyRecords<EmailThreadMessageType>({
    depth: 3,
    limit: 10,
    filter: {
      messageThreadId: {
        eq: viewableEmailThread?.id,
      },
    },
    objectNameSingular: CoreObjectNameSingular.Message,
    orderBy: {
      receivedAt: 'DescNullsLast',
    },
    skip: !viewableEmailThread,
    useRecordsWithoutConnection: true,
  });

  const fetchMoreMessages = useCallback(() => {
    if (!loading) {
      fetchMoreRecords();
    }
  }, [fetchMoreRecords, loading]);

  if (!viewableEmailThread) {
    return null;
  }

  return (
    <StyledContainer>
      <EmailThreadHeader
        subject={viewableEmailThread.subject}
        lastMessageSentAt={viewableEmailThread.lastMessageReceivedAt}
      />
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
    </StyledContainer>
  );
};
