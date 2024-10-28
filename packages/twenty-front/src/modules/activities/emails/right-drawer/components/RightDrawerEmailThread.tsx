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
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { Button, IconArrowBackUp } from 'twenty-ui';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 85%;
  overflow-y: auto;
`;

const StyledButtonContainer = styled.div<{ isMobile: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  justify-content: flex-end;
  height: ${({ isMobile }) => (isMobile ? '100px' : '50px')};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  box-sizing: border-box;
`;

export const RightDrawerEmailThread = () => {
  const setMessageThread = useSetRecoilState(messageThreadState);
  const isMobile = useIsMobile();
  const {
    thread,
    messages,
    fetchMoreMessages,
    threadLoading,
    messageThreadExternalId,
    connectedAccountHandle,
    messageChannelLoading,
  } = useRightDrawerEmailThread();

  useEffect(() => {
    if (!messages[0]?.messageThread) {
      return;
    }
    setMessageThread(messages[0]?.messageThread);
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

  const messagesCount = messages.length;
  const is5OrMoreMessages = messagesCount >= 5;
  const firstMessages = messages.slice(
    0,
    is5OrMoreMessages ? 2 : messagesCount - 1,
  );
  const intermediaryMessages = is5OrMoreMessages
    ? messages.slice(2, messagesCount - 1)
    : [];
  const lastMessage = messages[messagesCount - 1];
  const subject = messages[0]?.subject;

  const canReply = useMemo(() => {
    return (
      connectedAccountHandle && lastMessage && messageThreadExternalId != null
    );
  }, [connectedAccountHandle, lastMessage, messageThreadExternalId]);

  const handleReplyClick = () => {
    if (!canReply) {
      return;
    }

    const url = `https://mail.google.com/mail/?authuser=${connectedAccountHandle}#all/${messageThreadExternalId}`;
    window.open(url, '_blank');
  };
  if (!thread || !messages.length) {
    return null;
  }
  return (
    <StyledWrapper>
      <StyledContainer>
        {threadLoading ? (
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
                sender={message.sender}
                participants={message.messageParticipants}
                body={message.text}
                sentAt={message.receivedAt}
              />
            ))}
            <IntermediaryMessages messages={intermediaryMessages} />
            <EmailThreadMessage
              key={lastMessage.id}
              sender={lastMessage.sender}
              participants={lastMessage.messageParticipants}
              body={lastMessage.text}
              sentAt={lastMessage.receivedAt}
              isExpanded
            />
            <CustomResolverFetchMoreLoader
              loading={threadLoading}
              onLastRowVisible={fetchMoreMessages}
            />
          </>
        )}
      </StyledContainer>
      {canReply && !messageChannelLoading && (
        <StyledButtonContainer isMobile={isMobile}>
          <Button
            onClick={handleReplyClick}
            title="Reply"
            Icon={IconArrowBackUp}
            disabled={!canReply}
          />
        </StyledButtonContainer>
      )}
    </StyledWrapper>
  );
};
