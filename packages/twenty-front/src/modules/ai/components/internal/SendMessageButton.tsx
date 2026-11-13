import { INBOX_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/InboxSendMessageEventName';
import { INBOX_STOP_EVENT_NAME } from '@/ai/constants/InboxStopEventName';
import { inboxIsLoadingSelector } from '@/ai/states/selectors/inboxIsLoadingSelector';
import { agentChatIsStreamingFamilyState } from '@/ai/states/agentChatIsStreamingFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxInputIsEmptySelector } from '@/ai/states/selectors/inboxInputIsEmptySelector';
import { inboxIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/inboxIsAssistantReplyPendingFamilySelector';
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
  const inboxInputIsEmpty = useAtomStateValue(inboxInputIsEmptySelector);

  const inboxIsLoading = useAtomStateValue(inboxIsLoadingSelector);

  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const agentChatIsStreaming = useAtomFamilyStateValue(
    agentChatIsStreamingFamilyState,
    { threadId: currentInboxThread },
  );
  const inboxIsAssistantReplyPending = useAtomFamilySelectorValue(
    inboxIsAssistantReplyPendingFamilySelector,
    currentInboxThread,
  );

  const handleSendClick = () => {
    dispatchBrowserEvent(INBOX_SEND_MESSAGE_EVENT_NAME);
  };

  const handleStopClick = () => {
    dispatchBrowserEvent(INBOX_STOP_EVENT_NAME);
  };

  if (agentChatIsStreaming || inboxIsAssistantReplyPending) {
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
      disabled={isDisabled || inboxInputIsEmpty || inboxIsLoading}
    >
      <IconArrowUp />
    </IconButton>
  );
};
