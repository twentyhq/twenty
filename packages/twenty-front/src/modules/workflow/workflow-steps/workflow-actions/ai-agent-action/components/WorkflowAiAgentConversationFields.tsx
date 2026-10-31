import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowAiAgentStepPanelProps } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepPanelProps';
import { WorkflowConversationFields } from '@/workflow/workflow-steps/workflow-actions/components/WorkflowConversationFields';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type WorkflowAiAgentConversationFieldsProps = WorkflowAiAgentStepPanelProps;

export const WorkflowAiAgentConversationFields = ({
  stepId,
  input,
  readonly,
  onInputChange,
}: WorkflowAiAgentConversationFieldsProps) => {
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );

  return (
    <>
      <FormTextFieldInput
        multiline
        label={t`Ask for human input`}
        placeholder={t`When should the agent stop and ask you? E.g. before sending any email or changing a deal's amount. Leave empty to never stop.`}
        defaultValue={input.humanInputInstructions ?? ''}
        onChange={(humanInputInstructions) =>
          onInputChange({ humanInputInstructions })
        }
        readonly={readonly}
      />

      {isAiChatInboxEnabled && (
        <>
          <FormSingleRecordPicker
            label={t`Recipient`}
            objectNameSingulars={[CoreObjectNameSingular.WorkspaceMember]}
            defaultValue={input.workspaceMemberId}
            onChange={(workspaceMemberId) =>
              onInputChange({
                workspaceMemberId: workspaceMemberId ?? undefined,
              })
            }
            disabled={readonly}
            testId="workflow-edit-action-ai-agent-recipient"
            VariablePicker={WorkflowVariablePicker}
          />

          <WorkflowConversationFields
            dropdownId={`workflow-ai-agent-conversation-${stepId}`}
            conversation={input.conversation}
            defaultScope="STEP"
            description={t`With the recipient, or the workflow creator when empty. It stays out of their inbox until the agent needs them.`}
            readonly={readonly}
            onChange={(conversation) => onInputChange({ conversation })}
          />
        </>
      )}
    </>
  );
};
