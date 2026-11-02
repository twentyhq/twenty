import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { v4 } from 'uuid';

import { ChatThreadPendingMessage } from '@/activities/emails/components/ChatThreadPendingMessage';
import { useSendAppChannelMessage } from '@/activities/emails/hooks/useSendAppChannelMessage';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { isNonEmptyString } from '@sniptt/guards';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPendingMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-height: ${themeCssVariables.spacing[30]};
  overflow-y: auto;
`;

const StyledInputBox = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
  }
`;

const StyledTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  outline: none;
  padding: 0;
  resize: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

type ChatThreadComposerProps = {
  messageThreadId: string;
  messageChannelId: string;
  channelName: string;
  recipientName: string | null;
  isDisconnected: boolean;
  onMessageSent: () => Promise<unknown>;
};

export const ChatThreadComposer = ({
  messageThreadId,
  messageChannelId,
  channelName,
  recipientName,
  isDisconnected,
  onMessageSent,
}: ChatThreadComposerProps) => {
  const { t } = useLingui();
  const { sendAppChannelMessage } = useSendAppChannelMessage();
  const [draft, setDraft] = useState('');
  const [pendingMessages, setPendingMessages] = useState<PendingChatMessage[]>(
    [],
  );

  const setPendingMessageStatus = (
    id: string,
    status: PendingChatMessage['status'] | null,
  ) =>
    setPendingMessages((currentPendingMessages) =>
      status === null
        ? currentPendingMessages.filter((message) => message.id !== id)
        : currentPendingMessages.map((message) =>
            message.id === id ? { ...message, status } : message,
          ),
    );

  const send = async (pendingMessage: PendingChatMessage) => {
    setPendingMessageStatus(pendingMessage.id, 'sending');

    try {
      await sendAppChannelMessage({
        messageChannelId,
        messageThreadId,
        text: pendingMessage.text,
        idempotencyKey: pendingMessage.id,
      });
    } catch {
      setPendingMessageStatus(pendingMessage.id, 'failed');

      return;
    }

    await onMessageSent().catch(() => undefined);
    setPendingMessageStatus(pendingMessage.id, null);
  };

  const handleSubmit = () => {
    const text = draft.trim();

    if (!isNonEmptyString(text) || isDisconnected) {
      return;
    }

    const pendingMessage: PendingChatMessage = {
      id: v4(),
      text,
      status: 'sending',
    };

    setPendingMessages((currentPendingMessages) => [
      ...currentPendingMessages,
      pendingMessage,
    ]);
    setDraft('');
    send(pendingMessage);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const getPlaceholder = () => {
    if (isDisconnected) {
      return t`Reconnect ${channelName} to send messages`;
    }

    return isNonEmptyString(recipientName)
      ? t`Message ${recipientName}`
      : t`Write a message`;
  };

  return (
    <StyledContainer>
      {pendingMessages.length > 0 && (
        <StyledPendingMessages>
          {pendingMessages.map((pendingMessage) => (
            <ChatThreadPendingMessage
              key={pendingMessage.id}
              pendingMessage={pendingMessage}
              onRetry={send}
              onDiscard={({ id }) => setPendingMessageStatus(id, null)}
            />
          ))}
        </StyledPendingMessages>
      )}
      <StyledInputBox>
        <StyledTextarea
          aria-label={t`Message`}
          placeholder={getPlaceholder()}
          minRows={1}
          maxRows={8}
          value={draft}
          disabled={isDisconnected}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <StyledFooter>
          <IconButton
            variant="solid"
            color="accent"
            shape="round"
            size="sm"
            aria-label={t`Send`}
            disabled={isDisconnected || !isNonEmptyString(draft.trim())}
            onClick={handleSubmit}
          >
            <IconArrowUp />
          </IconButton>
        </StyledFooter>
      </StyledInputBox>
    </StyledContainer>
  );
};
