import { AGENT_CHAT_RETRY_EVENT_NAME } from '@/ai/constants/AgentChatRetryEventName';
import { agentChatIsStreamingState } from '@/ai/states/agentChatIsStreamingState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconAlertCircle, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

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
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
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
  const agentChatIsStreaming = useAtomStateValue(agentChatIsStreamingState);

  const handleRetryClick = () => {
    dispatchBrowserEvent(AGENT_CHAT_RETRY_EVENT_NAME);
  };

  const { theme } = useContext(ThemeContext);

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
        onClick={handleRetryClick}
        disabled={agentChatIsStreaming}
        title={t`Retry`}
      />
    </StyledErrorContainer>
  );
};
