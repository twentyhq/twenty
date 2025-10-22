import { type WorkflowActionType } from '@/workflow/types/Workflow';
import { DELAY_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/DelayAction';
import { FILTER_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/FilterAction';
import { ITERATOR_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/IteratorAction';

export const FLOW_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'ITERATOR' | 'FILTER' | 'DELAY'>;
  icon: string;
}> = [ITERATOR_ACTION, FILTER_ACTION, DELAY_ACTION];
