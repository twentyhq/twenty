import styled from '@emotion/styled';
import { useEffect, useMemo } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { IntermediaryMessages } from '@/activities/emails/right-drawer/components/IntermediaryMessages';
import { useRightDrawerEmailThread } from '@/activities/emails/right-drawer/hooks/useRightDrawerEmailThread';
import { emailThreadIdWhenEmailThreadWasClosedState } from '@/activities/emails/states/lastViewableEmailThreadIdState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { messageThreadState } from '@/ui/layout/right-drawer/states/messageThreadState';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';

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
  const setMessageThread = useSetRecoilState(messageThreadState);

  const { thread, messages, fetchMoreMessages, loading } =
    useRightDrawerEmailThread();

  const visibleMessages = useMemo(() => {
    return messages.filter(({ messageParticipants }) => {
      const from = messageParticipants.find(
        (participant) => participant.role === 'from',
      );
      const receivers = messageParticipants.filter(
        (participant) => participant.role !== 'from',
      );
      return from && receivers.length > 0;
    });
  }, [messages]);

  useEffect(() => {
    if (!visibleMessages[0]?.messageThread) {
      return;
    }
    setMessageThread(visibleMessages[0]?.messageThread);
  });

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  useRegisterClickOutsideListenerCallback({
    callbackId:
      'EmailThreadClickOutsideCallBack-' + (thread?.id ?? 'no-thread-id'),
    callbackFunction: useRecoilCallback(
      ({ set }) =>
        () => {
          set(
            emailThreadIdWhenEmailThreadWasClosedState,
            thread?.id ?? 'no-thread-id',
          );
        },
      [thread],
    ),
  });

  if (!thread) {
    return null;
  }

  const visibleMessagesCount = visibleMessages.length;
  const is5OrMoreMessages = visibleMessagesCount >= 5;
  const firstMessages = visibleMessages.slice(
    0,
    is5OrMoreMessages ? 2 : visibleMessagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? visibleMessages.slice(2, visibleMessagesCount - 1)
    : [];
  const lastMessage = visibleMessages[visibleMessagesCount - 1];
  const subject = visibleMessages[0]?.subject;

  return (
    <StyledContainer>
      {loading ? (
        <EmailLoader loadingText="Loading thread" />
      ) : (
        <>
          <EmailThreadHeader
            subject={subject}
            lastMessageSentAt={lastMessage.receivedAt}
          />
          {firstMessages.map((message) => (
            <EmailThreadMessage
              key={message.id}
              participants={message.messageParticipants}
              body={message.text}
              sentAt={message.receivedAt}
            />
          ))}
          <IntermediaryMessages messages={intermediaryMessages} />
          <EmailThreadMessage
            key={lastMessage.id}
            participants={lastMessage.messageParticipants}
            body={lastMessage.text}
            sentAt={lastMessage.receivedAt}
            isExpanded
          />
          <CustomResolverFetchMoreLoader
            loading={loading}
            onLastRowVisible={fetchMoreMessages}
          />
        </>
      )}
    </StyledContainer>
  );
};
