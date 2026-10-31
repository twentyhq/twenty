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
import { WorkflowAiAgentPermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabListComponentId';
import { WORKFLOW_AI_AGENT_TABS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabs';
import { useResetWorkflowAiAgentPermissionsStateOnSidePanelClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type AgentResponseSchema,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowConversation } from 'twenty-shared/workflow';
import { IconLock, IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import {
  FindOneAgentDocument,
  GetRoleDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SidePanelSkeletonLoader } from '~/loading/components/SidePanelSkeletonLoader';
import { WorkflowAiAgentPromptTab } from './WorkflowAiAgentPromptTab';

export type WorkflowAiAgentTabId =
  (typeof WORKFLOW_AI_AGENT_TABS)[keyof typeof WORKFLOW_AI_AGENT_TABS];

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

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const { t } = useLingui();
  const componentInstanceId = `${WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID}-${action.id}`;
  const agentId = action.settings.input.agentId;
  const isAgentBacked = isNonEmptyString(agentId);
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const {
    data: agentData,
    loading: agentLoading,
    refetch: refetchAgent,
  } = useQuery(FindOneAgentDocument, {
    variables: { id: agentId || '' },
    skip: !agentId,
  });

  useEffect(() => {
    if (agentData?.findOneAgent) {
      setWorkflowAiAgentActionAgent(agentData.findOneAgent);
    }
  }, [agentData, setWorkflowAiAgentActionAgent]);
  useResetWorkflowAiAgentPermissionsStateOnSidePanelClose();

  const [prompt, setPrompt] = useState(action.settings.input.prompt ?? '');
  const [instructions, setInstructions] = useState(
    action.settings.input.instructions ?? '',
  );
  const [modelId, setModelId] = useState(action.settings.input.modelId);
  const [modelConfiguration, setModelConfiguration] = useState(
    action.settings.input.modelConfiguration,
  );
  const [scope, setScope] = useState(action.settings.input.scope);
  const [humanInputInstructions, setHumanInputInstructions] = useState(
    action.settings.input.humanInputInstructions ?? '',
  );
  const [recipientWorkspaceMemberId, setRecipientWorkspaceMemberId] = useState(
    action.settings.input.workspaceMemberId,
  );
  const [conversation, setConversation] = useState(
    action.settings.input.conversation,
  );
  const [responseSchema, setResponseSchema] = useState<
    AgentResponseSchema | undefined
  >(undefined);

  // saves every field from the latest render, so editing one does not drop a pending edit of another
  const saveInput = useDebouncedCallback(() => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          prompt,
          ...(isAgentBacked
            ? {
                humanInputInstructions,
                workspaceMemberId: recipientWorkspaceMemberId,
                conversation,
              }
            : { instructions, modelId, modelConfiguration, scope }),
          ...(isDefined(responseSchema)
            ? { responseFormat: { type: 'json', schema: responseSchema } }
            : {}),
        },
        ...(isDefined(responseSchema)
          ? { outputSchema: agentResponseSchemaToOutputSchema(responseSchema) }
          : {}),
      },
    });
  }, 500);

  const handleAgentPromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    saveInput();
  };

  const handleInstructionsChange = (newInstructions: string) => {
    setInstructions(newInstructions);
    saveInput();
  };

  const handleModelIdChange = (newModelId: string) => {
    setModelId(newModelId);
    saveInput();
  };

  const handleModelConfigurationChange = (
    newModelConfiguration: ModelConfiguration,
  ) => {
    setModelConfiguration(newModelConfiguration);
    saveInput();
  };

  const handleScopeChange = (newScope: AiRunScope) => {
    setScope(newScope);
    saveInput();
  };

  const handleHumanInputInstructionsChange = (newInstructions: string) => {
    setHumanInputInstructions(newInstructions);
    saveInput();
  };

  const handleRecipientChange = (workspaceMemberId: string | undefined) => {
    setRecipientWorkspaceMemberId(workspaceMemberId);
    saveInput();
  };

  const handleConversationChange = (nextConversation: WorkflowConversation) => {
    setConversation(nextConversation);
    saveInput();
  };

  const handleResponseSchemaChange = (
    nextResponseSchema: AgentResponseSchema,
  ) => {
    setResponseSchema(nextResponseSchema);
    saveInput();
  };

  const isCurrentAgentLoaded =
    isDefined(workflowAiAgentActionAgent) &&
    workflowAiAgentActionAgent.id === agentId;

  // a legacy step's hidden agent is a system agent, edited from the step as before
  const isReusableAgentStep =
    isCurrentAgentLoaded && !workflowAiAgentActionAgent.isSystem;

  const tabs: SingleTabProps[] = [
    {
      id: WORKFLOW_AI_AGENT_TABS.PROMPT,
      title: t`Prompt`,
      Icon: IconSparkles,
    },
    ...(isReusableAgentStep
      ? []
      : [
          {
            id: WORKFLOW_AI_AGENT_TABS.PERMISSIONS,
            title: t`Permissions`,
            Icon: IconLock,
          },
        ]),
  ];

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );
  const currentTabId: WorkflowAiAgentTabId =
    !isReusableAgentStep && activeTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS
      ? WORKFLOW_AI_AGENT_TABS.PERMISSIONS
      : WORKFLOW_AI_AGENT_TABS.PROMPT;

  const navigateSettings = useNavigateSettings();
  const agentRoleId = workflowAiAgentActionAgent?.roleId;
  const { data: roleData } = useQuery(GetRoleDocument, {
    variables: { id: agentRoleId ?? '' },
    skip: !isAgentBacked || isReusableAgentStep || !isDefined(agentRoleId),
  });

  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);

  const role = roleData?.getRole;

  const handleViewRole = () => {
    if (isDefined(role?.id)) {
      navigateSettings(SettingsPath.RoleDetail, { roleId: role.id });
    }
  };

  const getFooterActions = () => {
    if (currentTabId !== WORKFLOW_AI_AGENT_TABS.PERMISSIONS) {
      return [];
    }

    if (workflowAiAgentPermissionsIsAddingPermission) {
      if (!isAgentBacked) {
        return [];
      }

      return [
        <WorkflowStepCmdEnterButton
          key="view-role"
          title={t`View role`}
          onClick={handleViewRole}
          disabled={!isDefined(role?.id)}
        />,
      ];
    }

    if (isDefined(actionOptions.readonly)) {
      return [];
    }

    return [
      <WorkflowStepCmdEnterButton
        key="add-permission"
        title={t`Add permission`}
        onClick={() => setWorkflowAiAgentPermissionsIsAddingPermission(true)}
      />,
    ];
  };

  return isAgentBacked && (agentLoading || !isCurrentAgentLoaded) ? (
    <SidePanelSkeletonLoader />
  ) : (
    <TabListRoot componentInstanceId={componentInstanceId}>
      <StyledTabListContainer>
        <TabList
          aria-label={t`Agent configuration`}
          tabs={tabs}
          componentInstanceId={componentInstanceId}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>
      <WorkflowStepTabPanel value={currentTabId}>
        {currentTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS ? (
          <WorkflowStepBody paddingBlock="0" paddingInline="0">
            <WorkflowAiAgentPermissionsTab
              stepId={action.id}
              readonly={actionOptions.readonly === true}
              isAgentBacked={isAgentBacked}
              scope={scope}
              onScopeChange={handleScopeChange}
              isAgentLoading={agentLoading}
              refetchAgent={refetchAgent}
            />
          </WorkflowStepBody>
        ) : (
          <WorkflowStepBody>
            <WorkflowAiAgentPromptTab
              action={action}
              isAgentBacked={isAgentBacked}
              isReusableAgentStep={isReusableAgentStep}
              prompt={prompt}
              readonly={actionOptions.readonly === true}
              onPromptChange={handleAgentPromptChange}
              instructions={instructions}
              onInstructionsChange={handleInstructionsChange}
              modelId={modelId}
              onModelIdChange={handleModelIdChange}
              modelConfiguration={modelConfiguration}
              onModelConfigurationChange={handleModelConfigurationChange}
              humanInputInstructions={humanInputInstructions}
              onHumanInputInstructionsChange={
                handleHumanInputInstructionsChange
              }
              recipientWorkspaceMemberId={recipientWorkspaceMemberId}
              onRecipientChange={handleRecipientChange}
              conversation={conversation}
              onConversationChange={handleConversationChange}
              onResponseSchemaChange={handleResponseSchemaChange}
            />
          </WorkflowStepBody>
        )}
      </WorkflowStepTabPanel>
      {!actionOptions.readonly && (
        <WorkflowStepFooter
          additionalActions={getFooterActions()}
          stepId={action.id}
        />
      )}
    </TabListRoot>
  );
};
