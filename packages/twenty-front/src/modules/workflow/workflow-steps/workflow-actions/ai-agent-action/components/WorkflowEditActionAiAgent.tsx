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
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  type AgentResponseSchema,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLock, IconSparkles } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useDebouncedCallback } from 'use-debounce';
import {
  useFindOneAgentQuery,
  useGetRolesQuery,
  useUpdateOneAgentMutation,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '../constants/WorkflowAiAgentTabListComponentId';
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
  const { data: agentData, loading: agentLoading } = useFindOneAgentQuery({
    variables: { id: agentId || '' },
    skip: !agentId,
  });
  const [updateAgent] = useUpdateOneAgentMutation();
  const aiModelOptions = useAiModelOptions();
  const { updateWorkflowVersionStep } = useUpdateWorkflowVersionStep();
  const flow = useFlowOrThrow();

  const agent = agentData?.findOneAgent;

  const handleAgentPromptChange = useDebouncedCallback(
    async (newPrompt: string) => {
      if (actionOptions.readonly === true || !isDefined(agent)) {
        return;
      }

      await updateAgent({
        variables: {
          input: {
            id: agent.id,
            prompt: newPrompt,
          },
        },
        refetchQueries: ['FindOneAgent'],
      });
    },
    500,
  );

  const handleAgentModelChange = async (modelId: string) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          modelId,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  };

  const handleModelConfigurationChange = async (
    configuration: ModelConfiguration,
  ) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          modelConfiguration: configuration,
        },
      },
      refetchQueries: ['FindOneAgent'],
    });
  };

  const updateAgentResponseFormat = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (actionOptions.readonly === true || !isDefined(agent)) {
      return;
    }

    await updateAgent({
      variables: {
        input: {
          id: agent.id,
          responseFormat: format,
        },
      },
      refetchQueries: ['FindOneAgent'],
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
  const [permissionsTabViewMode, setPermissionsTabViewMode] = useState<
    'home' | 'add-permission-objects' | 'add-permission-crud'
  >('home');
  const { data: rolesData } = useGetRolesQuery();

  const role = rolesData?.getRoles.find((item) => item.id === agent?.roleId);
  const objectPermissions = role?.objectPermissions || [];
  const existingPermissionsCount = objectPermissions.reduce((count, perm) => {
    return (
      count +
      (perm.canReadObjectRecords ? 1 : 0) +
      (perm.canUpdateObjectRecords ? 1 : 0) +
      (perm.canSoftDeleteObjectRecords ? 1 : 0) +
      (perm.canDestroyObjectRecords ? 1 : 0)
    );
  }, 0);

  const handleAgentResponseFormatChange = async (format: {
    type: 'text' | 'json';
    schema?: AgentResponseSchema;
  }) => {
    if (format.type !== agent?.responseFormat?.type) {
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
    const footerActions: React.ReactNode[] = [];

    if (currentTabId !== WORKFLOW_AI_AGENT_TABS.PERMISSIONS) {
      return footerActions;
    }

    if (
      permissionsTabViewMode === 'add-permission-objects' ||
      permissionsTabViewMode === 'add-permission-crud'
    ) {
      footerActions.push(
        <Button
          key="view-role"
          title={t`View role`}
          variant="primary"
          onClick={handleViewRole}
          disabled={!isDefined(role?.id)}
          size="small"
        />,
      );
    } else if (permissionsTabViewMode === 'home') {
      if (existingPermissionsCount > 0 || isDefined(role?.id)) {
        footerActions.push(
          <Button
            key="add-permission"
            title={t`Add permission`}
            variant="primary"
            onClick={() => setPermissionsTabViewMode('add-permission-objects')}
            disabled={actionOptions.readonly === true}
            size="small"
          />,
        );
      } else {
        footerActions.push(
          <Button
            key="view-role"
            title={t`View role`}
            variant="primary"
            onClick={handleViewRole}
            disabled={!isDefined(role?.id)}
            size="small"
          />,
        );
      }
    }

    return footerActions;
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
            viewMode={permissionsTabViewMode}
            onViewModeChange={setPermissionsTabViewMode}
          />
        </StyledPermissionsStepBody>
      ) : (
        <WorkflowStepBody>
          <WorkflowAiAgentPromptTab
            agent={agent}
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
