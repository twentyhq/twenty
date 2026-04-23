import { WorkflowActionMenuItems } from '@/side-panel/pages/workflow/action/components/WorkflowActionMenuItems';
import { logicFunctionsState } from '@/settings/logic-functions/states/logicFunctionsState';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { SidePanelStepListContainer } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepContainer';
import { SidePanelWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/SidePanelWorkflowSelectStepTitle';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { IconFunction } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export type WorkflowActionSelection = {
  type: WorkflowActionType;
  defaultSettings?: Record<string, unknown>;
};

export const SidePanelWorkflowSelectAction = ({
  onActionSelected,
}: {
  onActionSelected: (selection: WorkflowActionSelection) => void;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isDraftEmailEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DRAFT_EMAIL_ENABLED,
  );

  const { t } = useLingui();

  const logicFunctions = useAtomStateValue(logicFunctionsState);

  const toolFunctions = logicFunctions.filter((fn) => fn.isTool === true);

  const coreActions = isDraftEmailEnabled
    ? CORE_ACTIONS
    : CORE_ACTIONS.filter((action) => action.type !== 'DRAFT_EMAIL');

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

      {isAiEnabled && (
        <>
          <SidePanelWorkflowSelectStepTitle>
            {t`AI`}
          </SidePanelWorkflowSelectStepTitle>
          <WorkflowActionMenuItems
            actions={AI_ACTIONS}
            onClick={handleActionClick}
          />
        </>
      )}

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
        actions={coreActions}
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
              text={fn.name}
              onClick={() => handleFunctionClick(fn.id)}
            />
          ))}
        </>
      )}
    </SidePanelStepListContainer>
  );
};
