import { WorkflowStepCmdEnterButton } from '@/workflow/workflow-steps/components/WorkflowStepCmdEnterButton';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { WorkflowAiAgentPermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabListComponentId';
import { WORKFLOW_AI_AGENT_TABS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabs';
import { useResetWorkflowAiAgentPermissionsStateOnSidePanelClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLock, IconSparkles } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import {
  useFindOneAgentQuery,
  useGetRolesQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SidePanelSkeletonLoader } from '~/loading/components/SidePanelSkeletonLoader';
import { WorkflowAiAgentPromptTab } from './WorkflowAiAgentPromptTab';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const { loading: agentLoading, refetch: refetchAgent } = useFindOneAgentQuery(
    {
      variables: { id: agentId || '' },
      skip: !agentId,
      onCompleted: (data) => {
        setWorkflowAiAgentActionAgent(data.findOneAgent);
      },
    },
  );
  useResetWorkflowAiAgentPermissionsStateOnSidePanelClose();
  const [updateAgent] = useUpdateOneAgentMutation();
  const aiModelOptions = useAiModelOptions();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const flow = useFlowOrThrow();

  const actionPrompt = action.settings.input.prompt || '';
  const [prompt, setPrompt] = useState(actionPrompt);

  const savePrompt = useDebouncedCallback((newPrompt: string) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          ...action.settings.input,
          prompt: newPrompt,
        },
      },
    });
  }, 500);

  const handleAgentPromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    savePrompt(newPrompt);
  };

  const handleAgentModelChange = async (modelId: string) => {
    if (
      actionOptions.readonly === true ||
      !isDefined(workflowAiAgentActionAgent)
    ) {
      return;
    }

    const response = await updateAgent({
      variables: {
        input: {
          id: workflowAiAgentActionAgent.id,
          modelId,
        },
      },
    });

    setWorkflowAiAgentActionAgent({
      ...workflowAiAgentActionAgent,
      ...response.data?.updateOneAgent,
    });
  };

  const handleModelConfigurationChange = async (
    configuration: ModelConfiguration,
  ) => {
    if (
      actionOptions.readonly === true ||
      !isDefined(workflowAiAgentActionAgent)
    ) {
      return;
    }

    const response = await updateAgent({
      variables: {
        input: {
          id: workflowAiAgentActionAgent.id,
          modelConfiguration: configuration,
        },
      },
    });
    setWorkflowAiAgentActionAgent({
      ...workflowAiAgentActionAgent,
      ...response.data?.updateOneAgent,
    });
  };

  const updateAgentResponseFormat = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (
      actionOptions.readonly === true ||
      !isDefined(workflowAiAgentActionAgent)
    ) {
      return;
    }

    const response = await updateAgent({
      variables: {
        input: {
          id: workflowAiAgentActionAgent.id,
          responseFormat: format,
        },
      },
    });

    setWorkflowAiAgentActionAgent({
      ...workflowAiAgentActionAgent,
      ...response.data?.updateOneAgent,
    });

    await updateWorkflowVersionStep({
      workflowVersionId: flow.workflowVersionId,
      step: action,
    });
  };

  const debouncedUpdateAgentResponseFormat = useDebouncedCallback(
    updateAgentResponseFormat,
    300,
  );

  const tabs: SingleTabProps[] = [
    {
      id: WORKFLOW_AI_AGENT_TABS.PROMPT,
      title: t`Prompt`,
      Icon: IconSparkles,
    },
    {
      id: WORKFLOW_AI_AGENT_TABS.PERMISSIONS,
      title: t`Permissions`,
      Icon: IconLock,
    },
  ];

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    componentInstanceId,
  );
  const currentTabId =
    (activeTabId as WorkflowAiAgentTabId) ?? WORKFLOW_AI_AGENT_TABS.PROMPT;

  const navigateSettings = useNavigateSettings();
  const { data: rolesData } = useGetRolesQuery();

  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);

  const role = rolesData?.getRoles.find(
    (item) => item.id === workflowAiAgentActionAgent?.roleId,
  );

  const handleAgentResponseFormatChange = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (format.type !== workflowAiAgentActionAgent?.responseFormat?.type) {
      debouncedUpdateAgentResponseFormat.cancel();
      void updateAgentResponseFormat(format);
    } else {
      void debouncedUpdateAgentResponseFormat(format);
    }
  };

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

  return agentLoading ? (
    <SidePanelSkeletonLoader />
  ) : (
    <>
      <StyledTabListContainer>
        <TabList
          tabs={tabs}
          componentInstanceId={componentInstanceId}
          behaveAsLinks={false}
        />
      </StyledTabListContainer>
      {currentTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS ? (
        <WorkflowStepBody paddingBlock="0" paddingInline="0">
          <WorkflowAiAgentPermissionsTab
            action={action}
            readonly={actionOptions.readonly === true}
            isAgentLoading={agentLoading}
            refetchAgent={refetchAgent}
          />
        </WorkflowStepBody>
      ) : (
        <WorkflowStepBody>
          <WorkflowAiAgentPromptTab
            prompt={prompt}
            readonly={actionOptions.readonly === true}
            aiModelOptions={aiModelOptions}
            onPromptChange={handleAgentPromptChange}
            onModelChange={handleAgentModelChange}
            onModelConfigurationChange={handleModelConfigurationChange}
            onResponseFormatChange={handleAgentResponseFormatChange}
          />
        </WorkflowStepBody>
      )}
      {!actionOptions.readonly && (
        <WorkflowStepFooter
          additionalActions={getFooterActions()}
          stepId={action.id}
        />
      )}
    </>
  );
};
