import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

type GettingStartedChatThreadDoneButtonProps = {
  stepDefinition: Pick<GettingStartedStepDefinition, 'doneChatThreadId'>;
};

export const GettingStartedChatThreadDoneButton = ({
  stepDefinition: { doneChatThreadId },
}: GettingStartedChatThreadDoneButtonProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();

  if (!isDefined(doneChatThreadId)) {
    return null;
  }

  return (
    <Button size="sm" onClick={() => openAskAiThread(doneChatThreadId)}>
      {t`Continue thread`}
    </Button>
  );
};
