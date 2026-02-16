import { WorkflowActionMenuItems } from '@/command-menu/pages/workflow/action/components/WorkflowActionMenuItems';
import { logicFunctionsState } from '@/settings/logic-functions/states/logicFunctionsState';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { getActionIconColorOrThrow } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIconColorOrThrow';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconFunction } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export type WorkflowActionSelection = {
  type: WorkflowActionType;
  defaultSettings?: Record<string, unknown>;
};

export const CommandMenuWorkflowSelectAction = ({
  onActionSelected,
}: {
  onActionSelected: (selection: WorkflowActionSelection) => void;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isDraftEmailEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DRAFT_EMAIL_ENABLED,
  );
  const theme = useTheme();

  const { t } = useLingui();

  const logicFunctions = useRecoilValue(logicFunctionsState);

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
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        {t`Data`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={RECORD_ACTIONS}
        onClick={handleActionClick}
      />

      {isAiEnabled && (
        <>
          <RightDrawerWorkflowSelectStepTitle>
            {t`AI`}
          </RightDrawerWorkflowSelectStepTitle>
          <WorkflowActionMenuItems
            actions={AI_ACTIONS}
            onClick={handleActionClick}
          />
        </>
      )}

      <RightDrawerWorkflowSelectStepTitle>
        {t`Flow`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={FLOW_ACTIONS}
        onClick={handleActionClick}
      />

      <RightDrawerWorkflowSelectStepTitle>
        {t`Core`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={coreActions}
        onClick={handleActionClick}
      />

      <RightDrawerWorkflowSelectStepTitle>
        {t`Human Input`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={HUMAN_INPUT_ACTIONS}
        onClick={handleActionClick}
      />

      {toolFunctions.length > 0 && (
        <>
          <RightDrawerWorkflowSelectStepTitle>
            {t`Applications`}
          </RightDrawerWorkflowSelectStepTitle>
          {toolFunctions.map((fn) => (
            <MenuItem
              key={fn.id}
              withIconContainer={true}
              LeftIcon={() => (
                <IconFunction
                  color={getActionIconColorOrThrow({
                    theme,
                    actionType: 'LOGIC_FUNCTION',
                  })}
                  size={16}
                />
              )}
              text={fn.name}
              onClick={() => handleFunctionClick(fn.id)}
            />
          ))}
        </>
      )}
    </RightDrawerStepListContainer>
  );
};
