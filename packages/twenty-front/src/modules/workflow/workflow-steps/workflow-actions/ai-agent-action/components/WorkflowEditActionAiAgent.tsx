import { useAiAgentOutputSchema } from '@/ai/hooks/useAiAgentOutputSchema';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
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
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { useFindManyAgentsQuery } from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
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
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { getIcon } = useIcons();
  const { headerTitle, headerIcon, headerIconColor, headerType } =
    useWorkflowActionHeader({
      action,
      defaultTitle: 'AI Agent',
    });

  const agentId = action.settings.input.agentId;
  const prompt = action.settings.input.prompt || '';

  const { handleOutputSchemaChange, outputFields } = useAiAgentOutputSchema(
    action.settings.outputSchema as BaseOutputSchema,
    actionOptions.readonly === true ? undefined : actionOptions.onActionUpdate,
    action,
    actionOptions.readonly,
  );

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery();

  const agentOptions =
    agentsData?.findManyAgents?.reduce<SelectOption<string>[]>((acc, agent) => {
      if (agent.id !== currentWorkspace?.defaultAgent?.id) {
        acc.push({
          label: agent.label,
          value: agent.id,
          Icon: agent.icon ? getIcon(agent.icon) : undefined,
        });
      }
      return acc;
    }, []) || [];

  const noAgentsAvailable = agentOptions.length === 0;

  const handleAgentChange = (value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    actionOptions.onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          agentId: value,
        },
      },
    });
  };

  const handlePromptChange = (value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    actionOptions.onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          prompt: value,
        },
      },
    });
  };

  return agentsLoading ? (
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
            dropdownId="select-agent"
            label={t`Select Agent`}
            options={agentOptions}
            value={agentId}
            onChange={handleAgentChange}
            disabled={actionOptions.readonly || noAgentsAvailable}
            emptyOption={{
              label: noAgentsAvailable
                ? t`No agents available`
                : t`Select an agent`,
              value: '',
            }}
          />

          {noAgentsAvailable && (
            <StyledErrorMessage>
              {t`Please create agents in the AI settings to use in workflows.`}
            </StyledErrorMessage>
          )}
        </div>

        <FormTextFieldInput
          multiline
          VariablePicker={WorkflowVariablePicker}
          label={t`Instructions for AI`}
          placeholder={t`Describe what you want the AI to do...`}
          defaultValue={prompt}
          onChange={handlePromptChange}
          readonly={actionOptions.readonly}
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
