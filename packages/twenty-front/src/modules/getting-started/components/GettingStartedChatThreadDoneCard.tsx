import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { GettingStartedDoneCard } from '@/getting-started/components/GettingStartedDoneCard';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isNonEmptyString } from '@sniptt/guards';
import { IconMessage } from 'twenty-ui/icon';

type GettingStartedChatThreadDoneCardProps = {
  chatThreadId: string;
  fallbackTitle: string;
};

export const GettingStartedChatThreadDoneCard = ({
  chatThreadId,
  fallbackTitle,
}: GettingStartedChatThreadDoneCardProps) => {
  const { openAskAiThread } = useOpenAskAiThread();
  const chatThread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    chatThreadId,
  );

  return (
    <GettingStartedDoneCard
      Icon={IconMessage}
      title={
        isNonEmptyString(chatThread?.title) ? chatThread.title : fallbackTitle
      }
      onClick={() => openAskAiThread(chatThreadId)}
    />
  );
};
