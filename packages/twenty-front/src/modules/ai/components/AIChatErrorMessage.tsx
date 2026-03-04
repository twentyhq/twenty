import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconAlertCircle, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledErrorContainer = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.danger};
  border: 1px solid ${themeCssVariables.border.color.danger};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledErrorIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.red};
  display: flex;
`;

const StyledErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  flex: 1;
`;

const StyledErrorTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledErrorMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  word-break: break-word;
`;

type AIChatErrorMessageProps = {
  error: Error;
};

export const AIChatErrorMessage = ({ error }: AIChatErrorMessageProps) => {
  const { theme } = useContext(ThemeContext);
  const { handleRetry, isStreaming } = useAgentChatContextOrThrow();

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
        disabled={isStreaming}
        title={t`Retry`}
      />
    </StyledErrorContainer>
  );
};
