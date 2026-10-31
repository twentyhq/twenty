import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ChatThreadDisconnectedBanner } from '@/activities/emails/components/ChatThreadDisconnectedBanner';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { useChatReplyChannel } from '@/activities/emails/hooks/useChatReplyChannel';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { isDefined } from 'twenty-shared/utils';

type ChatThreadWidgetContentProps = {
  messageThreadId: string;
  messages: EmailThreadMessageWithSender[];
  messageChannelId: string | null;
  onMessageSent: () => void;
};

export const ChatThreadWidgetContent = ({
  messageThreadId,
  messages,
  messageChannelId,
  onMessageSent,
}: ChatThreadWidgetContentProps) => {
  const replyChannel = useChatReplyChannel(messageChannelId);

  const isDisconnected =
    isDefined(replyChannel) &&
    isApplicationConnectionReconnectNeeded(replyChannel.connectedAccount);

  const recipientName =
    messages
      .find(
        ({ sender }) =>
          isDefined(sender) &&
          sender.handle !== replyChannel?.messageChannel.handle,
      )
      ?.sender?.displayName.split(' ')[0] ?? null;

  return (
    <StyledWidgetContentContainer>
      <WidgetRelationsHeader />
      {isDefined(replyChannel) &&
        isDisconnected &&
        isDefined(replyChannel.connectedAccount.applicationId) && (
          <ChatThreadDisconnectedBanner
            applicationId={replyChannel.connectedAccount.applicationId}
            connectionProviderName={replyChannel.connectionProvider.name}
            channelName={replyChannel.connectionProvider.displayName}
            connectedAccountId={replyChannel.connectedAccount.id}
          />
        )}
      <StyledWidgetScrollContainer>
        <ChatThreadMessages messages={messages} />
      </StyledWidgetScrollContainer>
      {isDefined(replyChannel) && (
        <ChatThreadComposer
          messageThreadId={messageThreadId}
          messageChannelId={replyChannel.messageChannel.id}
          channelName={replyChannel.connectionProvider.displayName}
          applicationId={replyChannel.connectedAccount.applicationId ?? null}
          recipientName={recipientName}
          isDisconnected={isDisconnected}
          onMessageSent={onMessageSent}
        />
      )}
    </StyledWidgetContentContainer>
  );
};
