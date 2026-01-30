import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { DELAY_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DelayAction';
import { FILTER_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FilterAction';
import { IF_ELSE_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/IfElseAction';
import { ITERATOR_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/IteratorAction';

export const FLOW_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<
    WorkflowActionType,
    'ITERATOR' | 'FILTER' | 'IF_ELSE' | 'DELAY'
  >;
  icon: string;
}> = [ITERATOR_ACTION, FILTER_ACTION, IF_ELSE_ACTION, DELAY_ACTION];
