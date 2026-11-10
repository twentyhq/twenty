import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconButton, LightIconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { ChatThreadPendingMessage } from '@/activities/emails/components/ChatThreadPendingMessage';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { StyledChatComposerBox } from '@/chat/components/StyledChatComposerBox';

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

const StyledFiles = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledLeftActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
`;

const StyledFileInput = styled.input`
  display: none;
`;

type ChatThreadComposerProps = {
  channelName: string;
  recipientName: string | null;
  isDisconnected: boolean;
  isSendDisabled?: boolean;
  onSendMessage: (pendingMessage: PendingChatMessage) => Promise<unknown>;
  onMessageSent: () => Promise<unknown>;
  canAttachFiles?: boolean;
};

export const ChatThreadComposer = ({
  channelName,
  recipientName,
  isDisconnected,
  isSendDisabled = false,
  onSendMessage,
  onMessageSent,
  canAttachFiles = false,
}: ChatThreadComposerProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingChatMessage[]>(
    [],
  );

  const text = draft.trim();
  const canSend =
    !isDisconnected &&
    !isSendDisabled &&
    (isNonEmptyString(text) || isNonEmptyArray(files));

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
      await onSendMessage(pendingMessage);
    } catch {
      setPendingMessageStatus(pendingMessage.id, 'failed');

      return;
    }

    const isRefetched = await onMessageSent().then(
      () => true,
      () => false,
    );

    if (isRefetched) {
      setPendingMessages((currentPendingMessages) =>
        currentPendingMessages.filter(
          (message) =>
            message.id !== pendingMessage.id && message.status !== 'sent',
        ),
      );

      return;
    }

    setPendingMessageStatus(pendingMessage.id, 'sent');
  };

  const handleSubmit = () => {
    if (!canSend) {
      return;
    }

    const pendingMessage: PendingChatMessage = {
      id: v4(),
      text,
      files,
      status: 'sending',
    };

    setPendingMessages((currentPendingMessages) => [
      ...currentPendingMessages,
      pendingMessage,
    ]);
    setDraft('');
    setFiles([]);
    send(pendingMessage);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    setFiles((currentFiles) => [...currentFiles, ...selectedFiles]);
    event.target.value = '';
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
              isRetryDisabled={isSendDisabled}
              onRetry={send}
              onDiscard={({ id }) => setPendingMessageStatus(id, null)}
            />
          ))}
        </StyledPendingMessages>
      )}
      <StyledChatComposerBox>
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
        {isNonEmptyArray(files) && (
          <StyledFiles>
            {files.map((file, index) => (
              <AgentChatFilePreview
                key={`${index}-${file.name}`}
                file={file}
                onRemove={() =>
                  setFiles((currentFiles) =>
                    currentFiles.filter((currentFile) => currentFile !== file),
                  )
                }
              />
            ))}
          </StyledFiles>
        )}
        <StyledActions>
          <StyledLeftActions>
            {canAttachFiles && (
              <>
                <StyledFileInput
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                />
                <LightIconButton
                  aria-label={t`Attach files`}
                  disabled={isDisconnected}
                  emphasis="subtle"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconPlus />
                </LightIconButton>
              </>
            )}
          </StyledLeftActions>
          <IconButton
            variant="solid"
            color="accent"
            shape="round"
            size="sm"
            aria-label={t`Send`}
            disabled={!canSend}
            onClick={handleSubmit}
          >
            <IconArrowUp />
          </IconButton>
        </StyledActions>
      </StyledChatComposerBox>
    </StyledContainer>
  );
};
