import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ChatThreadDisconnectedBanner } from '@/activities/emails/components/ChatThreadDisconnectedBanner';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useSendPendingChatMessage } from '@/activities/emails/hooks/useSendPendingChatMessage';
import { useReplyConnectedAccount } from '@/activities/emails/hooks/useReplyConnectedAccount';
import { useStickToBottomScroll } from '@/activities/emails/hooks/useStickToBottomScroll';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
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
import { styled } from '@linaria/react';
import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  MyConnectedAccountsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledChatThreadBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

const StyledChatThreadScrollContent = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
`;

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
  const { sendPendingChatMessage } = useSendPendingChatMessage();
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const apolloClient = useApolloClient();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );
  const counterparts = useChatThreadCounterparts(messages);
  const soleCounterpart = counterparts?.length === 1 ? counterparts[0] : null;
  const { scrollContainerRef, scrollContentRef } = useStickToBottomScroll();

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
      {isDisconnected &&
        isDefined(connectionProvider) &&
        isDefined(connectedAccount.applicationId) && (
          <ChatThreadDisconnectedBanner
            applicationId={connectedAccount.applicationId}
            connectionProviderName={connectionProvider.name}
            connectionProviderType={connectionProvider.type}
            channelName={connectionProvider.displayName}
            connectedAccountId={connectedAccount.id}
            canReconnect={canReconnect}
          />
        )}
      <WidgetRelationsHeader />
      <StyledChatThreadBody>
        <StyledWidgetScrollContainer ref={scrollContainerRef}>
          <StyledChatThreadScrollContent ref={scrollContentRef}>
            <ChatThreadMessages messages={messages} />
            <CustomResolverFetchMoreLoader
              loading={loading}
              onLastRowVisible={onFetchMoreMessages}
            />
          </StyledChatThreadScrollContent>
        </StyledWidgetScrollContainer>
        {hasSendPermission &&
          canChannelSend &&
          isDefined(connectionProvider) && (
            <ChatThreadComposer
              key={messageThreadId}
              channelName={connectionProvider.displayName}
              recipientName={
                isDefined(soleCounterpart)
                  ? getDisplayNameFromParticipant({
                      participant: soleCounterpart,
                    })
                  : null
              }
              isDisconnected={isDisconnected}
              draftKey={
                isDefined(currentWorkspaceMember)
                  ? `${currentWorkspaceMember.id}:${messageThreadId}`
                  : undefined
              }
              onSendMessage={(pendingMessage) =>
                sendPendingChatMessage({
                  messageChannelId: messageChannel.id,
                  messageThreadId,
                  pendingMessage,
                }).catch((error) => {
                  apolloClient
                    .refetchQueries({ include: [MyConnectedAccountsDocument] })
                    .catch(() => undefined);

                  throw error;
                })
              }
              onMessageSent={onMessageSent}
            />
          )}
      </StyledChatThreadBody>
    </StyledWidgetContentContainer>
  );
};
