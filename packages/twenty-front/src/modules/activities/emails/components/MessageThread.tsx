import React from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { MessageThreadBody } from '@/activities/emails/components/MessageThreadBody';
import { MessageThreadBodyPreview } from '@/activities/emails/components/MessageThreadBodyPreview';
import { MessageThreadSender } from '@/activities/emails/components/MessageThreadSender';
import { MockedEmailUser } from '@/activities/emails/mocks/mockedThreads';
import { viewableMessageThreadIdsFamilyState } from '@/activities/emails/state/viewableMessageThreadIdsFamilyState';

const StyledMessageThread = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(4, 6)};
`;

const StyledMessageThreadHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

type MessageThreadProps = {
  id: string;
  body: string;
  sentAt: string;
  from: MockedEmailUser;
  to: MockedEmailUser[];
};

export const MessageThread = ({
  id,
  body,
  sentAt,
  from,
}: MessageThreadProps) => {
  const { displayName, avatarUrl } = from;
  const [openedMessageId, setIsOpenedMessage] = useRecoilState(
    viewableMessageThreadIdsFamilyState(id),
  );

  const isOpenedMessage = openedMessageId === id;

  const updateIsOpenedMessage = () => {
    if (isOpenedMessage) {
      setIsOpenedMessage(null);
    } else {
      setIsOpenedMessage(id);
    }
  };

  return (
    <StyledMessageThread onClick={() => updateIsOpenedMessage()}>
      <StyledMessageThreadHeader>
        <MessageThreadSender
          displayName={displayName}
          avatarUrl={avatarUrl}
          sentAt={sentAt}
        />
      </StyledMessageThreadHeader>
      {isOpenedMessage ? (
        <MessageThreadBody body={body} />
      ) : (
        <MessageThreadBodyPreview body={body} />
      )}
    </StyledMessageThread>
  );
};
