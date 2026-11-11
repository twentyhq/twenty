import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { AgentChatFilePreview } from '@/ai/components/internal/AgentChatFilePreview';
import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { ChatMessageReceipt } from '@/chat/components/ChatMessageReceipt';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageBubbleContent } from '@/chat/components/StyledChatMessageBubbleContent';
import { StyledChatMessageMeta } from '@/chat/components/StyledChatMessageMeta';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconRefresh, IconTrash } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPendingBubble = styled(StyledChatMessageBubble)<{
  isDimmed: boolean;
}>`
  opacity: ${({ isDimmed }) => (isDimmed ? 0.6 : 1)};
  white-space: pre-line;
`;

const StyledFiles = styled.div<{ isDimmed: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[1]};
  opacity: ${({ isDimmed }) => (isDimmed ? 0.6 : 1)};
`;

const StyledFailedRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type ChatThreadPendingMessageProps = {
  pendingMessage: PendingChatMessage;
  isRetryDisabled?: boolean;
  onRetry: (pendingMessage: PendingChatMessage) => void;
  onDiscard: (pendingMessage: PendingChatMessage) => void;
};

export const ChatThreadPendingMessage = ({
  pendingMessage,
  isRetryDisabled = false,
  onRetry,
  onDiscard,
}: ChatThreadPendingMessageProps) => {
  const { t } = useLingui();
  const isSending = pendingMessage.status === 'sending';

  return (
    <StyledChatMessageRow isRightAligned>
      {isNonEmptyString(pendingMessage.text) && (
        <StyledPendingBubble isUser isDimmed={isSending}>
          <StyledChatMessageBubbleContent>
            {pendingMessage.text}
            {pendingMessage.status !== 'failed' && (
              <StyledChatMessageMeta>
                <ChatMessageReceipt status={pendingMessage.status} />
              </StyledChatMessageMeta>
            )}
          </StyledChatMessageBubbleContent>
        </StyledPendingBubble>
      )}
      {isNonEmptyArray(pendingMessage.files) && (
        <StyledFiles isDimmed={isSending}>
          {pendingMessage.files.map((file, index) => (
            <AgentChatFilePreview key={`${index}-${file.name}`} file={file} />
          ))}
        </StyledFiles>
      )}
      {pendingMessage.status === 'failed' && (
        <StyledFailedRow>
          {t`Sending failed`}
          <LightIconButton
            aria-label={t`Retry`}
            disabled={isRetryDisabled}
            onClick={() => onRetry(pendingMessage)}
          >
            <IconRefresh />
          </LightIconButton>
          <LightIconButton
            aria-label={t`Delete`}
            onClick={() => onDiscard(pendingMessage)}
          >
            <IconTrash />
          </LightIconButton>
        </StyledFailedRow>
      )}
    </StyledChatMessageRow>
  );
};
