import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AI_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { aiChatIsLoadingSelector } from '@/ai/states/selectors/agentChatIsLoadingSelector';
import { aiChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { aiChatInputIsEmptySelector } from '@/ai/states/selectors/agentChatInputIsEmptySelector';
import { aiChatIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/agentChatIsAssistantReplyPendingFamilySelector';
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
  const aiChatInputIsEmpty = useAtomStateValue(aiChatInputIsEmptySelector);

  const aiChatIsLoading = useAtomStateValue(aiChatIsLoadingSelector);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );
  const aiChatIsAssistantReplyPending = useAtomFamilySelectorValue(
    aiChatIsAssistantReplyPendingFamilySelector,
    currentAiChatThread,
  );

  const handleSendClick = () => {
    dispatchBrowserEvent(AI_CHAT_SEND_MESSAGE_EVENT_NAME);
  };

  const handleStopClick = () => {
    dispatchBrowserEvent(AI_CHAT_STOP_EVENT_NAME);
  };

  if (aiChatIsStreaming || aiChatIsAssistantReplyPending) {
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
      disabled={isDisabled || aiChatInputIsEmpty || aiChatIsLoading}
    >
      <IconArrowUp />
    </IconButton>
  );
};
