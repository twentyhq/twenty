import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { useAnswerFormStepAsk } from '@/workflow/workflow-steps/workflow-actions/form-action/hooks/useAnswerFormStepAsk';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components';

type WorkflowFormStepAskSubmitButtonProps = {
  workflowRunId: string;
  stepId: string;
  disabled: boolean;
  getResponse: () => Promise<Record<string, unknown>>;
  onSubmitted: () => void;
};

export const WorkflowFormStepAskSubmitButton = ({
  workflowRunId,
  stepId,
  disabled,
  getResponse,
  onSubmitted,
}: WorkflowFormStepAskSubmitButtonProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { answerFormStepAsk } = useAnswerFormStepAsk({
    workflowRunId,
    stepId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (disabled || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const isSubmitted = await answerFormStepAsk(await getResponse());

      if (isSubmitted) {
        onSubmitted();

        return;
      }

      enqueueToast({
        variant: 'error',
        children: t`This form no longer waits for an answer`,
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }

    setIsSubmitting(false);
  };

  return (
    <WorkflowStepCmdEnterButton
      title={t`Submit`}
      onClick={() => void handleSubmit()}
      disabled={disabled || isSubmitting}
    />
  );
};
