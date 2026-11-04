import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';

type GettingStartedOpenChatThreadButtonProps = {
  chatThreadId: string;
};

export const GettingStartedOpenChatThreadButton = ({
  chatThreadId,
}: GettingStartedOpenChatThreadButtonProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();

  return (
    <Button
      onClick={() => openAskAiThread(chatThreadId)}
    >{t`Open the thread`}</Button>
  );
};
