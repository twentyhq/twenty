import { styled } from '@linaria/react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

type EmailThreadWidgetProps = {
  widget: PageLayoutWidget;
};

export const EmailThreadWidget = ({
  widget: _widget,
}: EmailThreadWidgetProps) => {
  const targetRecord = useTargetRecord();

  const { thread, messages, fetchMoreMessages, threadLoading } = useEmailThread(
    targetRecord.id,
  );

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

  if (threadLoading || !thread || !messages.length) {
    return (
      <StyledWrapper>
        <StyledContainer>
          <EmailLoader loadingText={t`Loading thread`} />
        </StyledContainer>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <StyledContainer>
        {
          <>
            {firstMessages.map((message) => (
              <EmailThreadMessage
                key={message.id}
                sender={message.sender}
                participants={message.messageParticipants}
                body={message.text}
                sentAt={message.receivedAt}
              />
            ))}
            <EmailThreadIntermediaryMessages messages={intermediaryMessages} />
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
        }
      </StyledContainer>
    </StyledWrapper>
  );
};
