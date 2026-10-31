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
import { WorkflowAiAgentScopePermissionsTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentScopePermissionsTab';
import { WorkflowAiAgentStepOwnedAgentPromptTab } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentStepOwnedAgentPromptTab';
import { WORKFLOW_AI_AGENT_TAB_LIST_COMPONENT_ID } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabListComponentId';
import { WORKFLOW_AI_AGENT_TABS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentTabs';
import { useResetWorkflowAiAgentPermissionsStateOnSidePanelClose } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useResetWorkflowAiAgentPermissionsStateOnSidePanelClose';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { type WorkflowAiAgentStepInput } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/types/WorkflowAiAgentStepInput';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getWorkflowAiAgentStepKind } from 'twenty-shared/workflow';
import { IconAlertTriangle, IconLock, IconSparkles } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { useDebouncedCallback } from 'use-debounce';
import {
  FindOneAgentDocument,
  GetRoleDocument,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { SidePanelSkeletonLoader } from '~/loading/components/SidePanelSkeletonLoader';

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
  const agentId = action.settings.input.agentId;
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const agent =
    isDefined(workflowAiAgentActionAgent) &&
    workflowAiAgentActionAgent.id === agentId
      ? workflowAiAgentActionAgent
      : undefined;
  const stepKind = getWorkflowAiAgentStepKind({
    input: action.settings.input,
    agent,
  });

  const { data: agentData, loading: agentLoading } = useQuery(
    FindOneAgentDocument,
    {
      variables: { id: agentId ?? '' },
      skip: stepKind === 'generate',
    },
  );

  useEffect(() => {
    if (agentData?.findOneAgent) {
      setWorkflowAiAgentActionAgent(agentData.findOneAgent);
    }
  }, [agentData, setWorkflowAiAgentActionAgent]);
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

  const hasPermissionsTab = stepKind !== 'agent';
  const tabs: SingleTabProps[] = [
    {
      id: WORKFLOW_AI_AGENT_TABS.PROMPT,
      title: t`Prompt`,
      Icon: IconSparkles,
    },
    ...(hasPermissionsTab
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
    hasPermissionsTab && activeTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS;
  const currentTabId: WorkflowAiAgentTabId = isPermissionsTabActive
    ? WORKFLOW_AI_AGENT_TABS.PERMISSIONS
    : WORKFLOW_AI_AGENT_TABS.PROMPT;

  const navigateSettings = useNavigateSettings();
  const agentRoleId = agent?.roleId;
  const { data: roleData } = useQuery(GetRoleDocument, {
    variables: { id: agentRoleId ?? '' },
    skip: stepKind !== 'stepOwnedAgent' || !isDefined(agentRoleId),
  });
  const role = roleData?.getRole;

  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useAtomState(workflowAiAgentPermissionsIsAddingPermissionState);

  const getFooterActions = () => {
    if (currentTabId !== WORKFLOW_AI_AGENT_TABS.PERMISSIONS) {
      return [];
    }

    if (stepKind === 'stepOwnedAgent') {
      return [
        <WorkflowStepCmdEnterButton
          key="view-role"
          title={t`View role`}
          onClick={() => {
            if (isDefined(role?.id)) {
              navigateSettings(SettingsPath.RoleDetail, { roleId: role.id });
            }
          }}
          disabled={!isDefined(role?.id)}
        />,
      ];
    }

    if (workflowAiAgentPermissionsIsAddingPermission || readonly) {
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

  if (stepKind !== 'generate' && !agentLoading && !isDefined(agentData)) {
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

  if (stepKind !== 'generate' && !isDefined(agent)) {
    return <SidePanelSkeletonLoader />;
  }

  const rolePermissionFlagKeys =
    role?.permissionFlags?.map((permissionFlag) => permissionFlag.flag) ?? [];

  const renderPermissionsTab = () => {
    if (stepKind === 'generate') {
      return (
        <WorkflowAiAgentScopePermissionsTab
          scope={input.scope}
          readonly={readonly}
          onScopeChange={(scope) => handleInputChange({ scope })}
        />
      );
    }

    return (
      <WorkflowAiAgentPermissionsTab
        readonly
        objectPermissions={role?.objectPermissions ?? []}
        permissionFlagKeys={rolePermissionFlagKeys}
      />
    );
  };

  const renderPromptTab = () => {
    if (stepKind === 'generate') {
      return (
        <WorkflowAiAgentGenerateStepPromptTab
          stepId={action.id}
          input={input}
          readonly={readonly}
          onInputChange={handleInputChange}
        />
      );
    }

    if (stepKind === 'stepOwnedAgent') {
      return (
        <WorkflowAiAgentStepOwnedAgentPromptTab
          stepId={action.id}
          input={input}
          readonly={readonly}
          onInputChange={handleInputChange}
        />
      );
    }

    return isDefined(agent) ? (
      <WorkflowAiAgentAgentStepPromptTab
        agent={agent}
        stepId={action.id}
        input={input}
        readonly={readonly}
        onInputChange={handleInputChange}
      />
    ) : null;
  };

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
      <WorkflowStepTabPanel value={currentTabId}>
        {currentTabId === WORKFLOW_AI_AGENT_TABS.PERMISSIONS ? (
          <WorkflowStepBody paddingBlock="0" paddingInline="0">
            {renderPermissionsTab()}
          </WorkflowStepBody>
        ) : (
          <WorkflowStepBody>{renderPromptTab()}</WorkflowStepBody>
        )}
      </WorkflowStepTabPanel>
      {!readonly && (
        <WorkflowStepFooter
          additionalActions={getFooterActions()}
          stepId={action.id}
        />
      )}
    </TabListRoot>
  );
};
