import styled from '@emotion/styled';
import { useRecoilCallback } from 'recoil';

import { FetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useRightDrawerEmailThread } from '@/activities/emails/right-drawer/hooks/useRightDrawerEmailThread';
import { emailThreadIdWhenEmailThreadWasClosedState } from '@/activities/emails/states/lastViewableEmailThreadIdState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
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
  const { thread, messages, fetchMoreMessages, loading } =
    useRightDrawerEmailThread();

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  useRegisterClickOutsideListenerCallback({
    callbackId:
      'EmailThreadClickOutsideCallBack-' + thread.id ?? 'no-thread-id',
    callbackFunction: useRecoilCallback(
      ({ set }) =>
        () => {
          set(emailThreadIdWhenEmailThreadWasClosedState, thread.id);
        },
      [thread],
    ),
  });

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
          <FetchMoreLoader
            loading={loading}
            onLastRowVisible={fetchMoreMessages}
          />
        </>
      )}
    </StyledContainer>
  );
};
