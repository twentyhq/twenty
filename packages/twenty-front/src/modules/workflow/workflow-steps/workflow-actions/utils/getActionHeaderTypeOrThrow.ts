import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { AI_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/AiActions';
import { CORE_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/CoreActions';
import { FLOW_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/FlowActions';
import { HUMAN_INPUT_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/HumanInputActions';
import { RECORD_ACTIONS } from '@/workflow/workflow-steps/workflow-actions/constants/RecordActions';
import { msg } from '@lingui/core/macro';

export const getActionHeaderTypeOrThrow = (actionType: WorkflowActionType) => {
  if (FLOW_ACTIONS.some((action) => action.type === actionType)) {
    return msg`Flow`;
  }

  if (CORE_ACTIONS.some((action) => action.type === actionType)) {
    return msg`Core`;
  }

  if (HUMAN_INPUT_ACTIONS.some((action) => action.type === actionType)) {
    return msg`Human Input`;
  }

  if (RECORD_ACTIONS.some((action) => action.type === actionType)) {
    return msg`Record`;
  }

  if (AI_ACTIONS.some((action) => action.type === actionType)) {
    return msg`AI`;
  }

  return msg`Action`;
};
