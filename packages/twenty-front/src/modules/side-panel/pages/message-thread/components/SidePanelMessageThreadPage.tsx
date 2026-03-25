import { styled } from '@linaria/react';
import { useEffect, useMemo } from 'react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { EmailLoader } from '@/activities/emails/components/EmailLoader';
import { EmailThreadHeader } from '@/activities/emails/components/EmailThreadHeader';
import { EmailThreadMessage } from '@/activities/emails/components/EmailThreadMessage';
import { SidePanelMessageThreadIntermediaryMessages } from '@/side-panel/pages/message-thread/components/SidePanelMessageThreadIntermediaryMessages';
import { useEmailThreadInSidePanel } from '@/side-panel/pages/message-thread/hooks/useEmailThreadInSidePanel';
import { messageThreadComponentState } from '@/side-panel/pages/message-thread/states/messageThreadComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { IconArrowBackUp } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 85%;
  overflow-y: auto;
`;

const StyledButtonContainer = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const ALLOWED_REPLY_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
  ConnectedAccountProvider.IMAP_SMTP_CALDAV,
];

export const SidePanelMessageThreadPage = () => {
  const setMessageThread = useSetAtomComponentState(
    messageThreadComponentState,
  );

  const {
    thread,
    messages,
    fetchMoreMessages,
    threadLoading,
    messageThreadExternalId,
    connectedAccountHandle,
    messageChannelLoading,
    connectedAccountProvider,
    lastMessageExternalId,
    connectedAccountConnectionParameters,
  } = useEmailThreadInSidePanel();

  useEffect(() => {
    if (!isDefined(messages[0]?.messageThread)) {
      return;
    }
    setMessageThread(messages[0]?.messageThread);
  }, [messages, setMessageThread]);

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
  const subject = messages[0]?.subject;

  const canReply = useMemo(() => {
    return (
      isDefined(connectedAccountHandle) &&
      isDefined(connectedAccountProvider) &&
      ALLOWED_REPLY_PROVIDERS.includes(connectedAccountProvider) &&
      (connectedAccountProvider !== ConnectedAccountProvider.IMAP_SMTP_CALDAV ||
        isDefined(connectedAccountConnectionParameters?.SMTP)) &&
      isDefined(lastMessage) &&
      messageThreadExternalId != null
    );
  }, [
    connectedAccountConnectionParameters,
    connectedAccountHandle,
    connectedAccountProvider,
    lastMessage,
    messageThreadExternalId,
  ]);

  const handleReplyClick = () => {
    if (!canReply) {
      return;
    }

    let url: string;
    switch (connectedAccountProvider) {
      case ConnectedAccountProvider.MICROSOFT:
        url = `https://outlook.office.com/mail/deeplink?ItemID=${lastMessageExternalId}`;
        window.open(url, '_blank');
        break;
      case ConnectedAccountProvider.GOOGLE:
        url = `https://mail.google.com/mail/?authuser=${connectedAccountHandle}#all/${messageThreadExternalId}`;
        window.open(url, '_blank');
        break;
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case null:
        return;
      default:
        assertUnreachable(connectedAccountProvider);
    }
  };
  if (!thread || !messages.length) {
    return null;
  }
  return (
    <StyledWrapper>
      <StyledContainer>
        {threadLoading ? (
          <EmailLoader loadingText={t`Loading thread`} />
        ) : (
          <>
            <EmailThreadHeader
              subject={subject}
              lastMessageSentAt={lastMessage.receivedAt}
            />
            {firstMessages.map((message) => (
              <EmailThreadMessage
                key={message.id}
                sender={message.sender}
                participants={message.messageParticipants}
                body={message.text}
                sentAt={message.receivedAt}
              />
            ))}
            <SidePanelMessageThreadIntermediaryMessages
              messages={intermediaryMessages}
            />
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
        )}
      </StyledContainer>
      {!messageChannelLoading && (
        <StyledButtonContainer>
          <Button
            size="small"
            onClick={handleReplyClick}
            title={t`Reply`}
            Icon={IconArrowBackUp}
            disabled={!canReply}
          />
        </StyledButtonContainer>
      )}
    </StyledWrapper>
  );
};
