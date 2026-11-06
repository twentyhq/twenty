import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

type GettingStartedChatThreadDoneButtonProps = {
  chatThreadId: string;
};

export const GettingStartedChatThreadDoneButton = ({
  chatThreadId,
}: GettingStartedChatThreadDoneButtonProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();

  return (
    <Button size="sm" onClick={() => openAskAiThread(chatThreadId)}>
      {t`Continue thread`}
    </Button>
  );
};
