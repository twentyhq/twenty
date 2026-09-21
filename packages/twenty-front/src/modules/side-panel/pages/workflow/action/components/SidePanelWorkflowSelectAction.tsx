import { JEV_MODEL_ID } from 'twenty-shared/ai';
import { aiEvaluationModelsState } from '@/client-config/states/aiEvaluationModelsState';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
import { ToolMenuItem } from '@/side-panel/pages/workflow/action/components/ToolMenuItem';
import { WorkflowActionMenuItems } from '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

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

  const logicFunctions = useAtomStateValue(logicFunctionsSelector);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const toolFunctions = logicFunctions.filter(
    (fn) =>
      isDefined(fn.workflowActionTriggerSettings) &&
      isDefined(fn.applicationId) &&
      !isWorkspaceCustomApplication({ id: fn.applicationId }, currentWorkspace),
  );

  const handleActionClick = (actionType: WorkflowActionType) => {
    if (actionType === 'CLASSIFY' && !isJevAvailable) {
      return;
    }
    onActionSelected({ type: actionType });
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
        actions={RECORD_ACTIONS}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`AI`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={AI_ACTIONS.map((action) =>
          action.type === 'CLASSIFY'
            ? {
                ...action,
                disabled: !isJevAvailable,
                contextualText: isJevAvailable
                  ? undefined
                  : t`TypeSafe AI API key missing`,
                tooltip: isJevAvailable
                  ? undefined
                  : t`Ask your administrator to configure TYPESAFE_AI_API_KEY in Settings → Admin panel and enable Jev.`,
              }
            : action,
        )}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`Flow`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={FLOW_ACTIONS}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`Core`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={CORE_ACTIONS}
        onClick={handleActionClick}
      />

      <SidePanelWorkflowSelectStepTitle>
        {t`Human Input`}
      </SidePanelWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={HUMAN_INPUT_ACTIONS}
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
