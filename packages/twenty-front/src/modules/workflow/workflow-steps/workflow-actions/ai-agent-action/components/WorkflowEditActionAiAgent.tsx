import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { AIChatTab } from '@/ai/components/AIChatTab';
import { useWorkflowActionHeader } from '@/workflow/workflow-steps/workflow-actions/hooks/useWorkflowActionHeader';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import {
  IconMessage,
  IconSettings,
  IconTool,
  useIcons,
} from 'twenty-ui/display';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import {
  WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID,
  WorkflowAiAgentTabId,
} from '../constants/workflow-ai-agent-tabs';
import { useAgentRoleAssignment } from '@/ai/hooks/useAgentRoleAssignment';
import { useAgentUpdateFormState } from '@/ai/hooks/useAgentUpdateFormState';
import { useAiAgentOutputSchema } from '@/ai/hooks/useAiAgentOutputSchema';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { WorkflowOutputSchemaBuilder } from './WorkflowOutputSchemaBuilder';

const StyledErrorMessage = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
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

  const agentId = action.settings.input.agentId;

  const { formValues, handleFieldChange, loading } = useAgentUpdateFormState({
    agentId,
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

  const activeTabId = useRecoilComponentValueV2(
    activeTabIdComponentState,
    WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID,
  );

  const { rolesOptions, selectedRole, handleRoleChange } =
    useAgentRoleAssignment(agentId);

  const tabs = [
    {
      id: WorkflowAiAgentTabId.SETTINGS,
      title: t`Settings`,
      Icon: IconSettings,
    },
    { id: WorkflowAiAgentTabId.TOOLS, title: t`Tools`, Icon: IconTool },
    { id: WorkflowAiAgentTabId.CHAT, title: t`Chat`, Icon: IconMessage },
  ];

  return loading ? (
    <RightDrawerSkeletonLoader />
  ) : (
    <>
      <StyledTabList
        tabs={tabs}
        behaveAsLinks={false}
        componentInstanceId={WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID}
      />
      {activeTabId === WorkflowAiAgentTabId.CHAT ? (
        <AIChatTab agentId={agentId} isWorkflowAgentNodeChat />
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
            {activeTabId === WorkflowAiAgentTabId.SETTINGS && (
              <>
                <div>
                  <Select
                    dropdownId="select-model"
                    label={t`AI Model`}
                    options={modelOptions}
                    value={formValues.modelId}
                    onChange={(value) => handleFieldChange('modelId', value)}
                    disabled={actionOptions.readonly || noModelsAvailable}
                    emptyOption={{
                      label: t`Auto`,
                      value: '',
                    }}
                  />

                  {noModelsAvailable && (
                    <StyledErrorMessage>
                      {t`You haven't configured any model provider. Please set up an API Key in your instance's admin panel or as an environment variable.`}
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
              </>
            )}
            {activeTabId === WorkflowAiAgentTabId.TOOLS && (
              <Select
                dropdownId="select-agent-role"
                label={t`Assign Role`}
                options={[{ label: t`No role`, value: '' }, ...rolesOptions]}
                value={selectedRole || ''}
                onChange={handleRoleChange}
                disabled={actionOptions.readonly}
              />
            )}
          </WorkflowStepBody>
        </>
      )}
    </>
  );
};
