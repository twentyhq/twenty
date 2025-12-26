import { CmdEnterActionButton } from '@/action-menu/components/CmdEnterActionButton';
import { useAiModelOptions } from '@/ai/hooks/useAiModelOptions';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { WorkflowAiAgentPermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionsTab';
import { WORKFLOW_AI_AGENT_TABS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabs';
import { useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
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
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabListComponentId';
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

const StyledTabList = styled(TabList)`
  background-color: ${({ theme }) => theme.background.secondary};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionsStepBody = styled(WorkflowStepBody)`
  padding-block: 0;
  padding-inline: 0;
`;

export const WorkflowEditActionAiAgent = ({
  action,
  actionOptions,
}: WorkflowEditActionAiAgentProps) => {
  const { t } = useLingui();
  const componentInstanceId = `${WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID}-${action.id}`;
  const agentId = action.settings.input.agentId;
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useRecoilState(workflowAiAgentActionAgentState);
  const { loading: agentLoading, refetch: refetchAgent } = useFindOneAgentQuery(
    {
      variables: { id: agentId || '' },
      skip: !agentId,
      onCompleted: (data) => {
        setWorkflowAiAgentActionAgent(data.findOneAgent);
      },
    },
  );
  useResetWorkflowAiAgentPermissionsStateOnCommandMenuClose();
  const [updateAgent] = useUpdateOneAgentMutation();
  const aiModelOptions = useAiModelOptions();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const flow = useFlowOrThrow();

  const handleAgentPromptChange = useDebouncedCallback(
    async (newPrompt: string) => {
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
            prompt: newPrompt,
          },
        },
      });

      setWorkflowAiAgentActionAgent({
        ...workflowAiAgentActionAgent,
        ...response.data?.updateOneAgent,
      });
    },
    500,
  );

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

  const activeTabId = useRecoilComponentValue(
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
  ] = useRecoilState(workflowAiAgentPermissionsIsAddingPermissionState);

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
        <CmdEnterActionButton
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
      <CmdEnterActionButton
        key="add-permission"
        title={t`Add permission`}
        onClick={() => setWorkflowAiAgentPermissionsIsAddingPermission(true)}
      />,
    ];
  };

  return agentLoading ? (
    <RightDrawerSkeletonLoader />
  ) : (
    <>
      <StyledTabList
        tabs={tabs}
        componentInstanceId={componentInstanceId}
        behaveAsLinks={false}
      />
      {currentTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS ? (
        <StyledPermissionsStepBody>
          <WorkflowAiAgentPermissionsTab
            action={action}
            readonly={actionOptions.readonly === true}
            isAgentLoading={agentLoading}
            refetchAgent={refetchAgent}
          />
        </StyledPermissionsStepBody>
      ) : (
        <WorkflowStepBody>
          <WorkflowAiAgentPromptTab
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
