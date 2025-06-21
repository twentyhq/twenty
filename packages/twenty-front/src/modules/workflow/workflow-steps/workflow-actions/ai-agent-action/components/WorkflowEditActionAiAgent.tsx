import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useIcons } from 'twenty-ui/display';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { useAgentUpdateFormState } from '../hooks/useAgentUpdateFormState';
import { useAiAgentOutputSchema } from '../hooks/useAiAgentOutputSchema';
import { useAiModelOptions } from '../hooks/useAiModelOptions';
import { WorkflowOutputSchemaBuilder } from './WorkflowOutputSchemaBuilder';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

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

  const { formValues, handleFieldChange, loading } = useAgentUpdateFormState({
    agentId: action.settings.input.agentId,
    readonly: actionOptions.readonly === true,
  });

  const { handleOutputSchemaChange, outputFields } = useAiAgentOutputSchema(
    action.settings.outputSchema as BaseOutputSchema,
    actionOptions.readonly === true ? undefined : actionOptions.onActionUpdate,
    action,
    actionOptions.readonly,
  );

  const modelOptions = useAiModelOptions();

  const noModelsAvailable = modelOptions.length === 0;

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
        <div>
          <Select
            dropdownId="select-model"
            label={t`AI Model`}
            options={modelOptions}
            value={formValues.modelId}
            onChange={(value) => handleFieldChange('modelId', value)}
            disabled={actionOptions.readonly || noModelsAvailable}
            emptyOption={{
              label: t`No AI models available`,
              value: '',
            }}
          />

          {noModelsAvailable && (
            <StyledErrorMessage>
              You haven't configured any model provider. Please set up an API
              Key in your instance's admin panel or as an environment variable.
            </StyledErrorMessage>
          )}
        </div>
        <FormTextFieldInput
          key={`prompt-${formValues.modelId ? action.id : 'empty'}`}
          label={t`Instructions for AI`}
          placeholder={t`Describe what you want the AI to do...`}
          readonly={actionOptions.readonly}
          defaultValue={formValues.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          VariablePicker={WorkflowVariablePicker}
          multiline
        />
        <WorkflowOutputSchemaBuilder
          fields={outputFields}
          onChange={handleOutputSchemaChange}
          readonly={actionOptions.readonly}
        />
      </WorkflowStepBody>
    </>
  );
};
