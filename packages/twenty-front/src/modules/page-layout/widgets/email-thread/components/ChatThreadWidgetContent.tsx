import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ChatThreadDisconnectedBanner } from '@/activities/emails/components/ChatThreadDisconnectedBanner';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { useChatReplyChannel } from '@/activities/emails/hooks/useChatReplyChannel';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type ChatThreadWidgetContentProps = {
  messageThreadId: string;
  messages: EmailThreadMessageWithSender[];
  loading: boolean;
  onFetchMoreMessages: () => void;
  messageChannelId: string | null;
  onMessageSent: () => Promise<unknown>;
};

export const ChatThreadWidgetContent = ({
  messageThreadId,
  messages,
  loading,
  onFetchMoreMessages,
  messageChannelId,
  onMessageSent,
}: ChatThreadWidgetContentProps) => {
  const replyChannel = useChatReplyChannel(messageChannelId);
  const canSendMessages = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );

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
        <CustomResolverFetchMoreLoader
          loading={loading}
          onLastRowVisible={onFetchMoreMessages}
        />
      </StyledWidgetScrollContainer>
      {isDefined(replyChannel) && canSendMessages && (
        <ChatThreadComposer
          key={messageThreadId}
          messageThreadId={messageThreadId}
          messageChannelId={replyChannel.messageChannel.id}
          channelName={replyChannel.connectionProvider.displayName}
          recipientName={recipientName}
          isDisconnected={isDisconnected}
          onMessageSent={onMessageSent}
        />
      )}
    </StyledWidgetContentContainer>
  );
};
