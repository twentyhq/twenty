import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useReplyContext } from '@/activities/emails/hooks/useReplyContext';
import { type EmailThreadDraftSeed } from '@/activities/emails/types/EmailThreadDraftSeed';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getEmailThreadDraftSeedFromMessage } from '@/activities/emails/utils/getEmailThreadDraftSeedFromMessage';
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

  const [composerIntent, setComposerIntent] = useState<
    'opened' | 'closed' | null
  >(null);
  const [clickedDraftSeed, setClickedDraftSeed] =
    useState<EmailThreadDraftSeed | null>(null);
  const [previousTargetRecordId, setPreviousTargetRecordId] = useState(
    targetRecord.id,
  );

  if (previousTargetRecordId !== targetRecord.id) {
    setPreviousTargetRecordId(targetRecord.id);
    setComposerIntent(null);
    setClickedDraftSeed(null);
  }

  const handleComposerOpenChange = useCallback((open: boolean) => {
    setComposerIntent(open ? 'opened' : 'closed');

    if (!open) {
      setClickedDraftSeed(null);
    }
  }, []);

  const handleDraftClick = useCallback((message: EmailThreadMessageWithSender) => {
    setClickedDraftSeed(getEmailThreadDraftSeedFromMessage(message));
    setComposerIntent('opened');
  }, []);

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

  const trailingDraft = lastMessage?.isDraft ? lastMessage : undefined;
  const draftSeed =
    clickedDraftSeed ??
    (isDefined(trailingDraft)
      ? getEmailThreadDraftSeedFromMessage(trailingDraft)
      : null);
  const isComposerOpen =
    composerIntent === 'opened' ||
    (composerIntent === null && isDefined(trailingDraft));

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
            message={message}
            onDraftClick={handleDraftClick}
          />
        ))}
        <EmailThreadIntermediaryMessages
          messages={intermediaryMessages}
          onDraftClick={handleDraftClick}
        />
        <EmailThreadMessage
          key={lastMessage.id}
          message={lastMessage}
          isExpanded
          hideBottomBorder={!isComposerOpen}
          onDraftClick={handleDraftClick}
        />
        <CustomResolverFetchMoreLoader
          loading={threadLoading}
          onLastRowVisible={fetchMoreMessages}
        />
      </StyledContainer>
      {canReply && (
        <EmailThreadComposer
          key={draftSeed?.messageId ?? 'reply'}
          replyContext={replyContext}
          isInSidePanel={isInSidePanel}
          isComposerOpen={isComposerOpen}
          setIsComposerOpen={handleComposerOpenChange}
          draftSeed={draftSeed}
        />
      )}
    </StyledWrapper>
  );
};
