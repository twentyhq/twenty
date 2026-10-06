import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useWorkflowRunStepInfo } from '@/workflow/workflow-steps/hooks/useWorkflowRunStepInfo';

type WorkflowRunStepAiAgentConversationButtonProps = {
  stepId: string;
  stepLogThreadId?: string;
};

export const WorkflowRunStepAiAgentConversationButton = ({
  stepId,
  stepLogThreadId,
}: WorkflowRunStepAiAgentConversationButtonProps) => {
  const { t } = useLingui();
  const { openAskAiThread } = useOpenAskAiThread();
  const stepInfo = useWorkflowRunStepInfo({ stepId });
  // runs from before the step log held the conversation kept it on the step info
  const threadId = stepLogThreadId ?? stepInfo?.threadId;

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
