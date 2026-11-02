import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useMessageThreadChannel } from '@/activities/emails/hooks/useMessageThreadChannel';
import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { ChatThreadWidgetContent } from '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent';
import { EmailThreadWidget } from '@/page-layout/widgets/email-thread/components/EmailThreadWidget';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

type MessageThreadWidgetProps = {
  widget: PageLayoutWidget;
};

export const MessageThreadWidget = ({
  widget: _widget,
}: MessageThreadWidgetProps) => {
  const targetRecord = useTargetRecord();

  const {
    thread,
    messages,
    fetchMoreMessages,
    refetchMessages,
    threadLoading,
    lastMessageChannelId,
  } = useEmailThread(targetRecord.id);

  const { messageThreadChannel, messageThreadChannelLoading } =
    useMessageThreadChannel(targetRecord.id);

  const lastMessage = messages.at(-1);

  if (
    (threadLoading && !isDefined(lastMessage)) ||
    messageThreadChannelLoading
  ) {
    return (
      <StyledWidgetContentContainer>
        <WidgetRelationsHeader />
        <StyledWidgetScrollContainer>
          <EmailLoader loadingText={t`Loading thread`} />
        </StyledWidgetScrollContainer>
      </StyledWidgetContentContainer>
    );
  }

  if (!isDefined(thread) || !isDefined(lastMessage)) {
    return (
      <StyledWidgetContentContainer>
        <WidgetRelationsHeader />
        <StyledWidgetScrollContainer>
          <EmptyState.Root>
            <AnimatedPlaceholder type="emptyInbox" />
            <EmptyState.Content>
              <EmptyState.Title>{t`No messages to show`}</EmptyState.Title>
              <EmptyState.Description>
                {t`The messages in this thread are missing or incomplete.`}
              </EmptyState.Description>
            </EmptyState.Content>
          </EmptyState.Root>
        </StyledWidgetScrollContainer>
      </StyledWidgetContentContainer>
    );
  }

  if (isChatTimelineThreadChannel(messageThreadChannel)) {
    return (
      <ChatThreadWidgetContent
        messageThreadId={thread.id}
        messages={messages}
        loading={threadLoading}
        onFetchMoreMessages={fetchMoreMessages}
        messageChannelId={lastMessageChannelId}
        onMessageSent={refetchMessages}
      />
    );
  }

  return (
    <EmailThreadWidget
      messages={messages}
      lastMessage={lastMessage}
      loading={threadLoading}
      onFetchMoreMessages={fetchMoreMessages}
    />
  );
};
