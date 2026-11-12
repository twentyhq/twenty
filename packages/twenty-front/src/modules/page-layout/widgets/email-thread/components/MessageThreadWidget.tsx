import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { useMessageThreadChannel } from '@/activities/emails/hooks/useMessageThreadChannel';
import { useSubscribeToMessageThreadMessages } from '@/activities/emails/hooks/useSubscribeToMessageThreadMessages';
import { isChatTimelineThreadChannel } from '@/activities/emails/utils/isChatTimelineThreadChannel';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { ChatThreadWidgetContent } from '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent';
import { EmailThreadWidgetContent } from '@/page-layout/widgets/email-thread/components/EmailThreadWidgetContent';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';

type MessageThreadWidgetProps = {
  widget: PageLayoutWidget;
};

export const MessageThreadWidget = ({
  widget: _widget,
}: MessageThreadWidgetProps) => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();

  const {
    thread,
    messages,
    fetchMoreMessages,
    refetchMessages,
    threadLoading,
    isFetchingMoreMessages,
    lastMessageChannelId,
  } = useEmailThread(targetRecord.id);

  useSubscribeToMessageThreadMessages({
    messageThreadId: targetRecord.id,
    loadedMessageIds: messages.map(({ id }) => id),
    refetchMessages,
  });

  const { messageThreadChannel, messageThreadChannelLoading } =
    useMessageThreadChannel(targetRecord.id);

  const lastMessage = messages.at(-1);

  const isFirstLoad =
    threadLoading && (!isDefined(thread) || !isDefined(lastMessage));

  if (isFirstLoad || messageThreadChannelLoading) {
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
        loading={isFetchingMoreMessages}
        onFetchMoreMessages={fetchMoreMessages}
        messageChannelId={lastMessageChannelId}
        onMessageSent={refetchMessages}
      />
    );
  }

  return (
    <EmailThreadWidgetContent
      messages={messages}
      lastMessage={lastMessage}
      loading={threadLoading}
      onFetchMoreMessages={fetchMoreMessages}
      messageChannelId={lastMessageChannelId}
    />
  );
};
