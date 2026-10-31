import { aiEvaluationModelsState } from '@/client-config/states/aiEvaluationModelsState';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { AgentMenuItem } from '@/side-panel/pages/workflow/action/components/AgentMenuItem';
import { ToolMenuItem } from '@/side-panel/pages/workflow/action/components/ToolMenuItem';
import { WorkflowActionMenuItems } from '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems';
import { sortWorkflowActionLogicFunctions } from '@/side-panel/pages/workflow/action/utils/sortWorkflowActionLogicFunctions';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useWorkspaceFeatureFlagsMap } from '@/workspace/hooks/useWorkspaceFeatureFlagsMap';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { JEV_MODEL_ID } from 'twenty-shared/ai';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { isAgentSelectableAsWorkflowStep } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/isAgentSelectableAsWorkflowStep';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { WORKFLOW_ACTION_FEATURE_FLAGS } from 'twenty-shared/workflow';
import {
  FeatureFlagKey,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';

export type WorkflowActionSelection = {
  type: WorkflowActionType;
  defaultSettings?: Record<string, unknown>;
};

export const SidePanelWorkflowSelectAction = ({
  onActionSelected,
}: {
  onActionSelected: (selection: WorkflowActionSelection) => void;
}) => {
  const { t } = useLingui();

  const aiEvaluationModels = useAtomStateValue(aiEvaluationModelsState);
  const isJevAvailable = aiEvaluationModels.some(
    (model) => model.modelId === JEV_MODEL_ID && model.isAvailable,
  );

  const aiActions = AI_ACTIONS.map((action) =>
    action.type === 'CLASSIFY' && !isJevAvailable
      ? {
          ...action,
          disabled: true,
          contextualText: t`TypeSafe AI API key missing`,
        }
      : action,
  );

  const featureFlagsMap = useWorkspaceFeatureFlagsMap();

  const isActionEnabled = ({ type }: { type: WorkflowActionType }) => {
    // Hidden from the picker only, so the AI workflow tools can still add it
    if (type === 'WAIT_FOR_EVENT') {
      return featureFlagsMap[FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED] === true;
    }

    const featureFlag = WORKFLOW_ACTION_FEATURE_FLAGS[type];

    return !isDefined(featureFlag) || featureFlagsMap[featureFlag] === true;
  };

  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const toolFunctions = sortWorkflowActionLogicFunctions({
    logicFunctions: logicFunctions.filter(
      (fn) =>
        isDefined(fn.workflowActionTriggerSettings) &&
        isDefined(fn.applicationId) &&
        !isWorkspaceCustomApplication(
          { id: fn.applicationId },
          currentWorkspace,
        ),
    ),
    installedApplications: currentWorkspace?.installedApplications ?? [],
  });

  const { data: agentsData } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const stepAgents = (agentsData?.findManyAgents ?? []).filter(
    isAgentSelectableAsWorkflowStep,
  );

  const handleActionClick = (actionType: WorkflowActionType) => {
    if (actionType === 'AI_AGENT') {
      // they replace a step's settings on a type change, so Generate drops an agent step's agent
      onActionSelected({
        type: actionType,
        defaultSettings: { input: { instructions: '', prompt: '' } },
      });

      return;
    }

    onActionSelected({ type: actionType });
  };

  const handleAgentClick = (agentId: string) => {
    onActionSelected({
      type: 'AI_AGENT',
      defaultSettings: { input: { agentId } },
    });
  };

  const handleFunctionClick = (logicFunctionId: string) => {
    onActionSelected({
      type: 'LOGIC_FUNCTION',
      defaultSettings: {
        input: { logicFunctionId, logicFunctionInput: {} },
      },
    });
  };

  return (
    <SidePanelStepListContainer>
      <SidePanelWorkflowSelectStepTitle>
        {t`Data`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={RECORD_ACTIONS.filter(isActionEnabled)}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`AI`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={aiActions.filter(isActionEnabled)}
        onClick={handleActionClick}
      />

      {stepAgents.length > 0 && (
        <>
          <SidePanelWorkflowSelectStepTitle>
            {t`Agents`}
          </SidePanelWorkflowSelectStepTitle>
          {stepAgents.map((agent) => (
            <AgentMenuItem
              key={agent.id}
              agent={agent}
              onClick={() => handleAgentClick(agent.id)}
            />
          ))}
        </>
      )}

      <SidePanelWorkflowSelectStepTitle>
        {t`Flow`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={FLOW_ACTIONS.filter(isActionEnabled)}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`Core`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={CORE_ACTIONS.filter(isActionEnabled)}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`Human Input`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={HUMAN_INPUT_ACTIONS.filter(isActionEnabled)}
        onClick={handleActionClick}
      />

      {toolFunctions.length > 0 && (
        <>
          <SidePanelWorkflowSelectStepTitle>
            {t`Other`}
          </SidePanelWorkflowSelectStepTitle>
          {toolFunctions.map((fn) => (
            <ToolMenuItem
              key={fn.id}
              logicFunction={fn}
              onClick={() => handleFunctionClick(fn.id)}
            />
          ))}
        </>
      )}
    </SidePanelStepListContainer>
  );
};
