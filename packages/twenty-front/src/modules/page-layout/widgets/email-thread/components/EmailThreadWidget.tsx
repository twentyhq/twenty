import { styled } from '@linaria/react';
import { useState } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { EmailThreadComposer } from '@/page-layout/widgets/email-thread/components/EmailThreadComposer';
import { EmailThreadIntermediaryMessages } from '@/page-layout/widgets/email-thread/components/EmailThreadIntermediaryMessages';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

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
  const { isInSidePanel } = useLayoutRenderingContext();

  const { thread, messages, fetchMoreMessages, threadLoading } = useEmailThread(
    targetRecord.id,
  );

  const replyContext = useReplyContext(targetRecord.id);

  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const canReply = isDefined(replyContext) && !replyContext.loading;

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
          hideBottomBorder={!isComposerOpen}
        />
        <CustomResolverFetchMoreLoader
          loading={threadLoading}
          onLastRowVisible={fetchMoreMessages}
        />
      </StyledContainer>
      {canReply && (
        <EmailThreadComposer
          replyContext={replyContext}
          isInSidePanel={isInSidePanel}
          isComposerOpen={isComposerOpen}
          setIsComposerOpen={setIsComposerOpen}
        />
      )}
    </StyledWrapper>
  );
};
