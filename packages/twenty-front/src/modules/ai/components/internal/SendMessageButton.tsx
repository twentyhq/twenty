import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { agentChatIsLoadingSelector } from '@/ai/states/selectors/agentChatIsLoadingSelector';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatInputIsEmptySelector } from '@/ai/states/selectors/agentChatInputIsEmptySelector';
import { agentChatIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/agentChatIsAssistantReplyPendingFamilySelector';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';

type SendMessageButtonProps = {
  isDisabled?: boolean;
};

export const SendMessageButton = ({
  isDisabled = false,
}: SendMessageButtonProps) => {
  const { t } = useLingui();
  const agentChatInputIsEmpty = useAtomStateValue(
    agentChatInputIsEmptySelector,
  );

  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingSelector);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    agentChatIsAssistantReplyPendingFamilySelector,
    currentAiChatThread,
  );

  const handleSendClick = () => {
    dispatchBrowserEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
  };

  const handleStopClick = () => {
    dispatchBrowserEvent(AGENT_CHAT_STOP_EVENT_NAME);
  };

  if (agentChatIsStreaming || agentChatIsAssistantReplyPending) {
    return (
      <IconButton
        variant="solid"
        color="accent"
        shape="round"
        aria-label={t`Stop response`}
        size="sm"
        onClick={handleStopClick}
      >
        <IconPlayerStop />
      </IconButton>
    );
  }

  return (
    <IconButton
      variant="solid"
      color="accent"
      shape="round"
      aria-label={t`Send message`}
      size="sm"
      onClick={handleSendClick}
      disabled={isDisabled || agentChatInputIsEmpty || agentChatIsLoading}
    >
      <IconArrowUp />
    </IconButton>
  );
};
