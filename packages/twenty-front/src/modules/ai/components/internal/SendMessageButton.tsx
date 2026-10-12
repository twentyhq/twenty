import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { useAiChatFileUpload } from '@/ai/hooks/useAiChatFileUpload';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsLoadingSelector } from '@/ai/states/selectors/agentChatIsLoadingSelector';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatInputIsEmptySelector } from '@/ai/states/selectors/agentChatInputIsEmptySelector';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconArrowUp, IconPlayerStop } from 'twenty-ui/icon';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type SendMessageButtonProps = {
  onSend: () => void;
  isDisabled?: boolean;
};

export const SendMessageButton = ({
  onSend,
  isDisabled = false,
}: SendMessageButtonProps) => {
  const agentChatInputIsEmpty = useAtomStateValue(
    agentChatInputIsEmptySelector,
  );

  const agentChatIsLoading = useAtomStateValue(agentChatIsLoadingSelector);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentAiChatThread },
  );
  const agentChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    agentChatIsAwaitingFirstChunkFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatSelectedFiles = useAtomStateValue(agentChatSelectedFilesState);
  const { cancelAllUploads } = useAiChatFileUpload();

  // Send refuses to run while attachments are uploading, so stop is the one
  // thing left to press then, and it cancels the uploads.
  const hasUploadsInFlight = agentChatSelectedFiles.length > 0;

  const handleStopClick = () => {
    if (hasUploadsInFlight) {
      cancelAllUploads();
    }

    dispatchBrowserEvent(AGENT_CHAT_STOP_EVENT_NAME);
  };

  if (
    agentChatIsStreaming ||
    agentChatIsAwaitingFirstChunk ||
    hasUploadsInFlight
  ) {
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
      onClick={onSend}
      disabled={isDisabled || agentChatInputIsEmpty || agentChatIsLoading}
    >
      <IconArrowUp />
    </IconButton>
  );
};
