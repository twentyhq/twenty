import { logicFunctionsSelector } from '@/logic-functions/states/logicFunctionsSelector';
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
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconFunction } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

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

  const logicFunctions = useAtomStateValue(logicFunctionsSelector);

  const toolFunctions = logicFunctions.filter((fn) =>
    isDefined(fn.workflowActionTriggerSettings),
  );

  const handleActionClick = (actionType: WorkflowActionType) => {
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
        actions={AI_ACTIONS}
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
            {t`Applications`}
          </SidePanelWorkflowSelectStepTitle>
          {toolFunctions.map((fn) => (
            <MenuItem
              key={fn.id}
              withIconContainer={true}
              LeftIcon={() => (
                <IconFunction
                  color={getActionIconColorOrThrow('LOGIC_FUNCTION')}
                  size={16}
                />
              )}
              text={fn.workflowActionTriggerSettings?.label ?? fn.name}
              onClick={() => handleFunctionClick(fn.id)}
            />
          ))}
        </>
      )}
    </SidePanelStepListContainer>
  );
};
