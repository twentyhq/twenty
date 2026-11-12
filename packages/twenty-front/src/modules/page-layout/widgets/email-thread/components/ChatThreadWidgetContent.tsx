import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { ChatThreadComposer } from '@/activities/emails/components/ChatThreadComposer';
import { ChatThreadDisconnectedBanner } from '@/activities/emails/components/ChatThreadDisconnectedBanner';
import { ChatThreadMessages } from '@/activities/emails/components/ChatThreadMessages';
import { useChatThreadCounterparts } from '@/activities/emails/hooks/useChatThreadCounterparts';
import { useSendAppChannelMessage } from '@/activities/emails/hooks/useSendAppChannelMessage';
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
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledChatThreadBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
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
  const { applicationsWithPreferences } = useApplicationsWithPreferences();
  const { sendAppChannelMessage } = useSendAppChannelMessage();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const hasSendPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );
  const counterparts = useChatThreadCounterparts(messages);
  const firstCounterpart = counterparts?.[0];
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
      <StyledChatThreadBody>
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
        {hasSendPermission &&
          canChannelSend &&
          isDefined(connectionProvider) && (
            <ChatThreadComposer
              key={messageThreadId}
              channelName={connectionProvider.displayName}
              recipientName={
                isDefined(firstCounterpart)
                  ? getDisplayNameFromParticipant({
                      participant: firstCounterpart,
                    })
                  : null
              }
              isDisconnected={isDisconnected}
              onSendMessage={({ id, text }) =>
                sendAppChannelMessage({
                  messageChannelId: messageChannel.id,
                  messageThreadId,
                  text,
                  idempotencyKey: id,
                })
              }
              onMessageSent={onMessageSent}
            />
          )}
      </StyledChatThreadBody>
    </StyledWidgetContentContainer>
  );
};
