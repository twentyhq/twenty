import { useAiAgentOutputSchema } from '@/ai/hooks/useAiAgentOutputSchema';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowActionFooter } from '@/workflow/workflow-steps/components/WorkflowActionFooter';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { type BaseOutputSchemaDeprecated } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
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

  const { handleOutputSchemaChange, outputFields } = useAiAgentOutputSchema(
    action.settings.outputSchema as BaseOutputSchemaDeprecated,
    actionOptions.readonly === true ? undefined : actionOptions.onActionUpdate,
    action,
    actionOptions.readonly,
  );

  const { data: agentsData, loading: agentsLoading } = useFindManyAgentsQuery();

  const agentOptions = (agentsData?.findManyAgents || []).reduce<
    SelectOption<string>[]
  >(
    (acc, agent) => {
      if (agent.id !== currentWorkspace?.defaultAgent?.id) {
        acc.push({
          label: agent.label,
          value: agent.id,
          Icon: agent.icon ? getIcon(agent.icon) : undefined,
        });
      }
      return acc;
    },
    [
      {
        label: t`No Agent`,
        value: '',
      },
    ],
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

        <WorkflowOutputSchemaBuilder
          fields={outputFields}
          onChange={handleOutputSchemaChange}
          readonly={actionOptions.readonly}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowActionFooter stepId={action.id} />}
    </>
  );
};
