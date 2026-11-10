import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { StyledChatMessageBubble } from '@/chat/components/StyledChatMessageBubble';
import { StyledChatMessageRow } from '@/chat/components/StyledChatMessageRow';
import { AttachmentChip } from '@/file/components/AttachmentChip';
import { isNonEmptyString } from '@sniptt/guards';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconRefresh, IconTrash } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledPendingBubble = styled(StyledChatMessageBubble)<{
  isDimmed: boolean;
}>`
  opacity: ${({ isDimmed }) => (isDimmed ? 0.6 : 1)};
  white-space: pre-line;
`;

const StyledPendingAttachments = styled.div<{ isDimmed: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
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
  onRetry: (pendingMessage: PendingChatMessage) => void;
  onDiscard: (pendingMessage: PendingChatMessage) => void;
};

export const ChatThreadPendingMessage = ({
  pendingMessage,
  onRetry,
  onDiscard,
}: ChatThreadPendingMessageProps) => {
  const { t } = useLingui();
  const isDimmed = pendingMessage.status === 'sending';

  return (
    <StyledChatMessageRow isRightAligned>
      {isNonEmptyString(pendingMessage.text) && (
        <StyledPendingBubble isUser isDimmed={isDimmed}>
          {pendingMessage.text}
        </StyledPendingBubble>
      )}
      {pendingMessage.attachments.length > 0 && (
        <StyledPendingAttachments isDimmed={isDimmed}>
          {pendingMessage.attachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              file={attachment}
              onRemove={() => undefined}
              readonly
            />
          ))}
        </StyledPendingAttachments>
      )}
      {pendingMessage.status === 'failed' && (
        <StyledFailedRow>
          {t`Sending failed`}
          <LightIconButton
            aria-label={t`Retry`}
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
