import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useWorkflowRunStepInfo } from '@/workflow/workflow-steps/hooks/useWorkflowRunStepInfo';

export const WorkflowRunStepAiAgentConversationButton = ({
  stepId,
}: {
  stepId: string;
}) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();
  const stepInfo = useWorkflowRunStepInfo({ stepId });
  const threadId = stepInfo?.threadId;

  if (!isDefined(threadId)) {
    return null;
  }

  return (
    <Button
      startIcon={<IconMessage />}
      size="sm"
      onClick={() => openAskAiThread(threadId)}
    >
      {t`Open conversation`}
    </Button>
  );
};
