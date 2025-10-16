import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { useAgentChatRequestBody } from '@/ai/hooks/useAgentChatRequestBody';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useChat } from '@ai-sdk/react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconAlertCircle, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledErrorContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.danger};
  border: 1px solid ${({ theme }) => theme.border.color.danger};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2, 3)};
`;

const StyledErrorIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
`;

const StyledErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1;
`;

const StyledErrorTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  word-break: break-word;
`;

type AIChatErrorMessageProps = {
  error: Error;
  records?: ObjectRecord[];
};

export const AIChatErrorMessage = ({
  error,
  records,
}: AIChatErrorMessageProps) => {
  const theme = useTheme();
  const { chat } = useAgentChatContextOrThrow();
  const { buildRequestBody } = useAgentChatRequestBody();
  const { regenerate, status } = useChat({ chat });

  const handleRetry = () => {
    regenerate({
      body: buildRequestBody(records),
    });
  };

  return (
    <StyledErrorContainer>
      <StyledErrorIcon>
        <IconAlertCircle size={theme.icon.size.md} />
      </StyledErrorIcon>
      <StyledErrorContent>
        <StyledErrorTitle>{t`Failed to get response`}</StyledErrorTitle>
        <StyledErrorMessage>
          {error.message || t`An error occurred while processing your message`}
        </StyledErrorMessage>
      </StyledErrorContent>
      <Button
        variant="secondary"
        size="small"
        Icon={IconRefresh}
        onClick={handleRetry}
        disabled={status === 'streaming'}
        title={t`Retry`}
      />
    </StyledErrorContainer>
  );
};
