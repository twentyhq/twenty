import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';

import { type PendingChatMessage } from '@/activities/emails/types/PendingChatMessage';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconRefresh, IconTrash } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledBubble = styled.div<{ isSending: boolean }>`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: 85%;
  opacity: ${({ isSending }) => (isSending ? 0.6 : 1)};
  overflow-wrap: break-word;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: pre-line;
`;

const StyledFailedRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
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

  return (
    <StyledContainer>
      <StyledBubble isSending={pendingMessage.status === 'sending'}>
        {pendingMessage.text}
      </StyledBubble>
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
    </StyledContainer>
  );
};
