import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { getHttpRequestOutputSchema } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/getHttpRequestOutputSchema';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { CodeEditor } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { ALL_MODELS } from '../constants/AIAgent';
import { useAgentUpdateFormState } from '../hooks/useAgentUpdateFormState';

type WorkflowEditActionAiAgentProps = {
  action: WorkflowAiAgentAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowAiAgentAction) => void;
      };
};

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'AI Agent',
    });

  const { formValues, setFormValues, updateAgent, loading } =
    useAgentUpdateFormState({
      agentId: action.settings.input.agentId,
    });

  const handleSave = useDebouncedCallback(async (formData) => {
    await updateAgent({
      name: formData.name,
      prompt: formData.prompt,
      model: formData.model,
      responseFormat: formData.responseFormat,
    });
  }, 500);

  const handleFieldChange = async (field: string, value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    setFormValues((prev) => ({ ...prev, [field]: value }));

    if (field === 'responseFormat') {
      try {
        const parsedResponseFormat = JSON.parse(value);
        const outputSchema = getHttpRequestOutputSchema(parsedResponseFormat);

        if (isDefined(actionOptions.onActionUpdate)) {
          actionOptions.onActionUpdate({
            ...action,
            settings: {
              ...action.settings,
              outputSchema,
            },
          });
        }
      } catch (error) {
        // do nothing
      }
    }

    await handleSave({ ...formValues, [field]: value });
  };

  return loading ? (
    <RightDrawerSkeletonLoader />
  ) : (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }
          actionOptions.onActionUpdate?.({ ...action, name: newName });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={headerIconColor}
        initialTitle={headerTitle}
        headerType={headerType}
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        <Select
          dropdownId="select-model"
          label="Model"
          options={ALL_MODELS}
          value={formValues.model}
          onChange={(value) => handleFieldChange('model', value)}
          disabled={actionOptions.readonly}
        />
        <FormTextFieldInput
          key={`prompt-${formValues.prompt || 'empty'}`}
          label="Prompt"
          placeholder="Enter prompt"
          readonly={actionOptions.readonly}
          defaultValue={formValues.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <div>
          <InputLabel>Output Format (JSON)</InputLabel>
          <CodeEditor
            height={200}
            value={formValues.responseFormat}
            language="json"
            onChange={(value) => handleFieldChange('responseFormat', value)}
            options={{
              readOnly: actionOptions.readonly,
              domReadOnly: actionOptions.readonly,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'on',
            }}
          />
        </div>
      </WorkflowStepBody>
    </>
  );
};
