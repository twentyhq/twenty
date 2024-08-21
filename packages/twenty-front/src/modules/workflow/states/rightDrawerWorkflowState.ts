import { RightDrawerWorkflowView } from '@/workflow/types/RightDrawerWorkflowView';
import { createState } from 'twenty-ui';

export const rightDrawerWorkflowState = createState<
  RightDrawerWorkflowView | undefined
>({
  key: 'rightDrawerWorkflowState',
  defaultValue: undefined,
});
