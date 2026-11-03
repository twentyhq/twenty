import { agentResponseSchemaToOutputSchema } from '@/ai/utils/agentResponseSchemaToOutputSchema';
import { TabListRoot } from '@/ui/layout/tab-list/components/TabListRoot';
import { WorkflowStepTabPanel } from '@/workflow/workflow-steps/components/WorkflowStepTabPanel';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowAiAgentAgentStepPromptTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentAgentStepPromptTab';
import { WorkflowAiAgentGenerateStepPromptTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentGenerateStepPromptTab';
import { WorkflowAiAgentPermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabListComponentId';
import { WORKFLOW_AI_AGENT_TABS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabs';
import { useResetWorkflowAiAgentPermissionsStateOnSidePanelClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { type WorkflowAiAgentStepInput } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepInput';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkflowAiAgentGenerateStep } from 'twenty-shared/workflow';
import { IconAlertTriangle, IconLock, IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import { FindOneAgentDocument } from '~/generated-metadata/graphql';
import { SidePanelSkeletonLoader } from '~/loading/components/SidePanelSkeletonLoader';

type WorkflowEditActionAiAgentProps = {
  action: WorkflowAiAgentAction;
  actionOptions:
    | { readonly: true }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowAiAgentAction) => void;
      };
};

const StyledTabListContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledMissingAgentState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[8]} ${themeCssVariables.spacing[3]};
  text-align: center;
`;

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const { t } = useLingui();
  const componentInstanceId = `${WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID}-${action.id}`;
  const readonly = actionOptions.readonly ?? false;
  const isGenerateStep = isWorkflowAiAgentGenerateStep(action.settings.input);

  const { data: agentData, loading: agentLoading } = useQuery(
    FindOneAgentDocument,
    {
      variables: { id: action.settings.input.agentId ?? '' },
      skip: isGenerateStep,
    },
  );
  const agent = agentData?.findOneAgent;

  useResetWorkflowAiAgentPermissionsStateOnSidePanelClose();

  const [input, setInput] = useState<WorkflowAiAgentStepInput>(
    action.settings.input,
  );

  // saves the input of the latest render, so editing one field does not drop a pending edit of another
  const saveInput = useDebouncedCallback(() => {
    if (actionOptions.readonly) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input,
        ...(input.responseFormat?.type === 'json'
          ? {
              outputSchema: agentResponseSchemaToOutputSchema(
                input.responseFormat.schema,
              ),
            }
          : {}),
      },
    });
  }, 500);

  const handleInputChange = (
    inputUpdate: Partial<WorkflowAiAgentStepInput>,
  ) => {
    setInput((currentInput) => ({ ...currentInput, ...inputUpdate }));
    saveInput();
  };

  // an agent step runs with its agent's role, edited on the agent
  const tabs: SingleTabProps[] = [
    {
      id: WORKFLOW_AI_AGENT_TABS.PROMPT,
      title: t`Prompt`,
      Icon: IconSparkles,
    },
    ...(isGenerateStep
      ? [
          {
            id: WORKFLOW_AI_AGENT_TABS.PERMISSIONS,
            title: t`Permissions`,
            Icon: IconLock,
          },
        ]
      : []),
  ];

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );
  const isPermissionsTabActive =
    isGenerateStep && activeTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS;

  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);

  const footerActions =
    isPermissionsTabActive &&
    !workflowAiAgentPermissionsIsAddingPermission &&
    !readonly
      ? [
          <WorkflowStepCmdEnterButton
            key="add-permission"
            title={t`Add permission`}
            onClick={() =>
              setWorkflowAiAgentPermissionsIsAddingPermission(true)
            }
          />,
        ]
      : [];

  if (!isGenerateStep && !agentLoading && !isDefined(agent)) {
    return (
      <>
        <StyledMissingAgentState>
          <IconAlertTriangle size={20} />
          <div>{t`The agent this step runs could not be loaded. It may have been deleted.`}</div>
        </StyledMissingAgentState>
        {!readonly && <WorkflowStepFooter stepId={action.id} />}
      </>
    );
  }

  if (!isGenerateStep && !isDefined(agent)) {
    return <SidePanelSkeletonLoader />;
  }

  return (
    <TabListRoot componentInstanceId={componentInstanceId}>
      <StyledTabListContainer>
        <TabList
          aria-label={t`Agent configuration`}
          tabs={tabs}
          componentInstanceId={componentInstanceId}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>
      <WorkflowStepTabPanel
        value={
          isPermissionsTabActive
            ? WORKFLOW_AI_AGENT_TABS.PERMISSIONS
            : WORKFLOW_AI_AGENT_TABS.PROMPT
        }
      >
        {isPermissionsTabActive ? (
          <WorkflowStepBody paddingBlock="0" paddingInline="0">
            <WorkflowAiAgentPermissionsTab
              scope={input.scope}
              readonly={readonly}
              onScopeChange={(scope) => handleInputChange({ scope })}
            />
          </WorkflowStepBody>
        ) : (
          <WorkflowStepBody>
            {isDefined(agent) ? (
              <WorkflowAiAgentAgentStepPromptTab
                agent={agent}
                stepId={action.id}
                input={input}
                readonly={readonly}
                onInputChange={handleInputChange}
              />
            ) : (
              <WorkflowAiAgentGenerateStepPromptTab
                stepId={action.id}
                input={input}
                readonly={readonly}
                onInputChange={handleInputChange}
              />
            )}
          </WorkflowStepBody>
        )}
      </WorkflowStepTabPanel>
      {!readonly && (
        <WorkflowStepFooter
          additionalActions={footerActions}
          stepId={action.id}
        />
      )}
    </TabListRoot>
  );
};
