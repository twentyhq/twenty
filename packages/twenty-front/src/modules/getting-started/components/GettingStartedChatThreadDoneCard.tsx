import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { GettingStartedDoneCard } from '@/getting-started/components/GettingStartedDoneCard';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconMessage } from 'twenty-ui/icon';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type GettingStartedChatThreadDoneCardProps = {
  chatThreadId: string;
  fallbackTitle: string;
};

export const GettingStartedChatThreadDoneCard = ({
  chatThreadId,
  fallbackTitle,
}: GettingStartedChatThreadDoneCardProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();
  const chatThread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    chatThreadId,
  );
  const lastActivityAt = chatThread?.lastActivityAt ?? chatThread?.updatedAt;
  const lastUpdate = isNonEmptyString(lastActivityAt)
    ? beautifyPastDateRelativeToNow(lastActivityAt)
    : undefined;

  return (
    <GettingStartedDoneCard
      Icon={IconMessage}
      title={
        isNonEmptyString(chatThread?.title) ? chatThread.title : fallbackTitle
      }
      meta={
        isNonEmptyString(lastUpdate) ? t`Last update: ${lastUpdate}` : undefined
      }
      onClick={() => openAskAiThread(chatThreadId)}
    />
  );
};
