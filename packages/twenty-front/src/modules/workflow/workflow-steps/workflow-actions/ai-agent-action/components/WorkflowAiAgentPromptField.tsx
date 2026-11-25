import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useLingui } from '@lingui/react/macro';

type WorkflowAiAgentPromptFieldProps = {
  prompt: string | undefined;
  readonly: boolean;
  onPromptChange: (prompt: string) => void;
};

export const WorkflowAiAgentPromptField = ({
  prompt,
  readonly,
  onPromptChange,
}: WorkflowAiAgentPromptFieldProps) => {
  const { t } = useLingui();
  return (
    <FormTextFieldInput
      multiline
      VariablePicker={WorkflowVariablePicker}
      label={t`Prompt`}
      placeholder={t`Describe what you want the AI to do...`}
      defaultValue={prompt ?? ''}
      onChange={onPromptChange}
      readonly={readonly}
    />
  );
};
