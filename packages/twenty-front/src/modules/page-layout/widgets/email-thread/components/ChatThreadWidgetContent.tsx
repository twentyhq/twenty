import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ChatThreadDisconnectedBanner } from '@/activities/emails/components/ChatThreadDisconnectedBanner';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import { useStickToBottomScroll } from '@/activities/emails/hooks/useStickToBottomScroll';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getParticipantFirstName } from '@/activities/emails/utils/getParticipantFirstName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WidgetRelationsHeader } from '@/page-layout/widgets/components/WidgetRelationsHeader';
import { useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { isPersonalConnectedAccount } from '@/settings/app-preferences/utils/isPersonalConnectedAccount';
import { canStartConnectionProviderAuthorization } from '@/settings/applications/utils/canStartConnectionProviderAuthorization';
import { isApplicationConnectionReconnectNeeded } from '@/settings/applications/utils/isApplicationConnectionReconnectNeeded';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  StyledWidgetContentContainer,
  StyledWidgetScrollContainer,
} from '@/ui/layout/components/WidgetContentContainer';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
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
  const { messageChannel, connectedAccount } =
    useReplyConnectedAccount(messageChannelId);
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );
  const counterparts = useChatThreadCounterparts(messages);
  const { scrollContainerRef, handleScroll } = useStickToBottomScroll(
    messages.length,
  );

  const connectionProvider = applicationsWithPreferences
    .flatMap(({ connectionProviders }) => connectionProviders)
    .find(({ id }) => id === connectedAccount?.connectionProviderId);

  const isDisconnected =
    isDefined(connectedAccount) &&
    isApplicationConnectionReconnectNeeded(connectedAccount);

  const userWorkspaceId = currentWorkspaceMember?.userWorkspaceId;

  const canReconnect =
    isDefined(connectedAccount) &&
    isDefined(connectionProvider) &&
    isNonEmptyString(userWorkspaceId) &&
    isPersonalConnectedAccount({
      account: connectedAccount,
      userWorkspaceId,
    }) &&
    canStartConnectionProviderAuthorization(connectionProvider);

  const canChannelSend =
    isDefined(messageChannel) &&
    isNonEmptyString(messageChannel.messagingProviderUniversalIdentifier) &&
    messageChannel.isSyncEnabled;

  return (
    <StyledWidgetContentContainer>
      <WidgetRelationsHeader />
      {isDisconnected &&
        isDefined(connectionProvider) &&
        isDefined(connectedAccount.applicationId) && (
          <ChatThreadDisconnectedBanner
            applicationId={connectedAccount.applicationId}
            connectionProviderName={connectionProvider.name}
            channelName={connectionProvider.displayName}
            connectedAccountId={connectedAccount.id}
            canReconnect={canReconnect}
          />
        )}
      <StyledWidgetScrollContainer
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <ChatThreadMessages messages={messages} />
        <CustomResolverFetchMoreLoader
          loading={loading}
          onLastRowVisible={onFetchMoreMessages}
        />
      </StyledWidgetScrollContainer>
      {hasSendPermission && canChannelSend && isDefined(connectionProvider) && (
        <ChatThreadComposer
          key={messageThreadId}
          messageThreadId={messageThreadId}
          messageChannelId={messageChannel.id}
          channelName={connectionProvider.displayName}
          recipientName={getParticipantFirstName(counterparts?.[0])}
          isDisconnected={isDisconnected}
          onMessageSent={onMessageSent}
        />
      )}
    </StyledWidgetContentContainer>
  );
};
