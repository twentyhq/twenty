import { WorkflowActionMenuItems } from '@/command-menu/pages/workflow/action/components/WorkflowActionMenuItems';
import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import { RightDrawerWorkflowSelectStepTitle } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepTitle';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { FeatureFlagKey } from '~/generated/graphql';

export const CommandMenuWorkflowSelectAction = ({
  onActionSelected,
}: {
  onActionSelected: (actionType: WorkflowActionType) => void;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isIfElseEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_IF_ELSE_ENABLED,
  );

  const { t } = useLingui();

  return (
    <RightDrawerStepListContainer>
      <RightDrawerWorkflowSelectStepTitle>
        {t`Data`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={RECORD_ACTIONS}
        onClick={onActionSelected}
      />

      {isAiEnabled && (
        <>
          <RightDrawerWorkflowSelectStepTitle>
            {t`AI`}
          </RightDrawerWorkflowSelectStepTitle>
          <WorkflowActionMenuItems
            actions={AI_ACTIONS}
            onClick={onActionSelected}
          />
        </>
      )}

      <RightDrawerWorkflowSelectStepTitle>
        {t`Flow`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={FLOW_ACTIONS.filter(
          (action) => action.type !== 'IF_ELSE' || isIfElseEnabled,
        )}
        onClick={onActionSelected}
      />

      <RightDrawerWorkflowSelectStepTitle>
        {t`Core`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={CORE_ACTIONS}
        onClick={onActionSelected}
      />

      <RightDrawerWorkflowSelectStepTitle>
        {t`Human Input`}
      </RightDrawerWorkflowSelectStepTitle>
      <WorkflowActionMenuItems
        actions={HUMAN_INPUT_ACTIONS}
        onClick={onActionSelected}
      />
    </RightDrawerStepListContainer>
  );
};
