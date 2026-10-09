import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { useSubmitFormStep } from '@/workflow/workflow-steps/workflow-actions/form-action/hooks/useSubmitFormStep';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components/feedback';

type WorkflowFormStepSubmitButtonProps = {
  workflowRunId: string;
  stepId: string;
  disabled: boolean;
  getResponse: () => Promise<Record<string, unknown>>;
  onSubmitted: () => void;
};

export const WorkflowFormStepSubmitButton = ({
  workflowRunId,
  stepId,
  disabled,
  getResponse,
  onSubmitted,
}: WorkflowFormStepSubmitButtonProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { submitFormStep } = useSubmitFormStep({
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
      await submitFormStep(await getResponse());
      onSubmitted();

      return;
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
