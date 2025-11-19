import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { AI_AGENT_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/AiAgentAction';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import {
  useFindManyAgentsQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { SettingsAgentResponseFormat } from '~/pages/settings/ai/components/SettingsAgentResponseFormat';

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
      defaultTitle: AI_AGENT_ACTION.defaultLabel,
    });

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery();
  const [updateAgent] = useUpdateOneAgentMutation();
  const aiModelOptions = useAiModelOptions();

  const agentOptions = (agentsData?.findManyAgents || []).reduce<
    SelectOption<string>[]
  >(
    (acc, agent) => {
      acc.push({
        label: agent.label,
        value: agent.id,
        Icon: agent.icon ? getIcon(agent.icon) : undefined,
      });
      return acc;
    },
    [
      {
        label: t`No Agent`,
        value: '',
      },
    ],
  );

  const selectedAgentId = action.settings.input.agentId;
  const selectedAgent = (agentsData?.findManyAgents || []).find(
    (agent) => agent.id === selectedAgentId,
  );

  const noAgentsAvailable = agentOptions.length === 0;

  const handleFieldChange = (field: 'agentId' | 'prompt', value: string) => {
    if (actionOptions.readonly === true) {
      return;
    }
    actionOptions.onActionUpdate?.({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          [field]: value,
        },
      },
    });
  };

  const handleAgentModelChange = async (modelId: string) => {
    if (
      actionOptions.readonly === true ||
      !selectedAgent ||
      !isDefined(selectedAgent)
    ) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: selectedAgent.id,
          label: selectedAgent.label,
          name: selectedAgent.name,
          prompt: selectedAgent.prompt,
          modelId,
        },
      },
      refetchQueries: ['FindManyAgents'],
    });
  };

  const handleAgentResponseFormatChange = async (format: {
    type: 'text' | 'json';
    schema?: BaseOutputSchemaV2;
  }) => {
    if (
      actionOptions.readonly === true ||
      !selectedAgent ||
      !isDefined(selectedAgent)
    ) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: selectedAgent.id,
          label: selectedAgent.label,
          name: selectedAgent.name,
          prompt: selectedAgent.prompt,
          modelId: selectedAgent.modelId,
          responseFormat: format.type === 'text' ? null : format,
        },
      },
      refetchQueries: ['FindManyAgents'],
    });
  };

  return agentsLoading ? (
    <RightDrawerSkeletonLoader />
  ) : (
    <>
      <SidePanelHeader
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
        iconTooltip={AI_AGENT_ACTION.defaultLabel}
      />
      <WorkflowStepBody>
        <div>
          <Select
            dropdownId="select-agent"
            label={t`Select Agent`}
            options={agentOptions}
            value={action.settings.input.agentId || ''}
            onChange={(value) => handleFieldChange('agentId', value)}
            disabled={actionOptions.readonly || noAgentsAvailable}
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
          defaultValue={action.settings.input.prompt}
          onChange={(value) => handleFieldChange('prompt', value)}
          readonly={actionOptions.readonly}
        />

        {selectedAgent && isDefined(selectedAgent) && (
          <>
            <Select
              dropdownId="select-agent-model"
              label={t`AI Model`}
              options={aiModelOptions}
              value={selectedAgent.modelId}
              onChange={handleAgentModelChange}
              disabled={actionOptions.readonly}
            />

            <SettingsAgentResponseFormat
              responseFormat={
                selectedAgent.responseFormat || { type: 'text', schema: {} }
              }
              onResponseFormatChange={handleAgentResponseFormatChange}
              disabled={actionOptions.readonly}
            />
          </>
        )}
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
